import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureSupabaseSession, checkExistingToken } from "../oauth";
import { supabase } from "../lib/supabase";
import { Github, Loader2, GitBranch, Code, Users } from "lucide-react";
import { useNeptuneStore } from "../store";
import { saveItem } from "tauri-plugin-keychain"

// Import the createOrUpdateUser function
async function createOrUpdateUser() {
  try {
    console.log("=== createOrUpdateUser started (Login component) ===");
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session retrieved:", !!session);
    console.log("Session user ID:", session?.user?.id);
    console.log("Session user metadata:", session?.user?.user_metadata);
    
    if (session) {
      // The GitHub data is directly in user_metadata, not nested under 'user'
      const gh = session.user.user_metadata;
      console.log("GitHub user data:", gh);
      
      const row = {
        id: session.user.id,            // UUID → FK for RLS
        author_name: gh.user_name || gh.preferred_username || gh.name, // GitHub username
        email: gh.email,
        avatar_url: gh.avatar_url,
        plan: 'free',                   // Default plan
        tokens_used: 0                  // Default token usage
      };
      
      console.log("User row to upsert:", row);
      console.log("Current user ID (for RLS):", session.user.id);

      const { data, error } = await supabase.from("users").upsert(row, { onConflict: "id" });
      
      if (error) {
        console.error("Failed to upsert user:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log("User upserted successfully:", data);
        
        // Set user in the store
        const store = useNeptuneStore.getState();
        store.setUser({
          id: 1, // Using a number as expected by the User interface
          login: row.author_name || 'unknown',
          avatarUrl: row.avatar_url || '',
          name: row.author_name,
          email: row.email
        });
        store.setHasToken(true);
        console.log("User set in store successfully");
      }
    } else {
      console.error("No session found");
    }
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
  }
}

export default function Login() {
  const [booting, setBooting] = useState(true);
  const [logging, setLogging] = useState(false);
  const nav = useNavigate();
  const { user, hasToken, setUser, setHasToken } = useNeptuneStore();

  /* auto-login */
  useEffect(() => {
    (async () => {
      // Check store first
      if (user && hasToken) {
        console.log("User found in store, navigating to home");
        nav("/home");
        return;
      }
      
      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Existing Supabase session found, navigating to home");
        // Ensure user exists in our database
        await createOrUpdateUser();
        nav("/home");
        return;
      }
      
      // Fallback to PAT check
      const pat = await checkExistingToken();
      console.log("checking pat")
      console.log("pat: " + pat)
      if (pat) nav("/home");
      setBooting(false);
    })();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        console.log("Session established, navigating to home");
        nav("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [nav, user, hasToken]);

  const signIn = async () => {
    setLogging(true);
    try { 
      await ensureSupabaseSession(); 
      console.log("navigating to home")
      nav("/home"); 
    }
    catch (error) { 
      console.error("Login failed:", error);
      alert("Login failed. Try again."); 
    }
    finally { 
      setLogging(false); 
    }
  };

  if (booting) return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <span className="text-white">Loading…</span>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-8">
          
          {/* Neptune Branding */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-900 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300">
                  <GitBranch className="w-9 h-9 text-white" />
                </div>
                  
              </div>
            </div>
            
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
              Neptune
            </h1>
            
            
          </div>
    
          {/* Brief Explanation */}
          <div className="text-center mb-12">
            <p className="text-gray-300 leading-relaxed mb-8">
              Experience the future of version control with visual git workflows, 
              AI-powered code reviews, and seamless team collaboration—all in one elegant interface.
            </p>
            
            {/* Key Features */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mb-2">
                  <Github className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400">Visual Git</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mb-2">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs text-gray-400">AI Reviews</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xs text-gray-400">Team Sync</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Stacked */}
          <div className="space-y-3 mb-8">

            {/* Open Repository Button */}
            <button 
            className="group relative w-full overflow-hidden rounded-2xl" 
            onClick={signIn}
            disabled={logging} >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800  rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-green-400/90 to-green-900/90 backdrop-blur-xl border border-white/20 text-white px-8 py-5 rounded-2xl font-semibold transition-all duration-300  group-hover:shadow-2xl group:hover group-hover:shadow-blue-500/25">
                  {logging ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-lg">Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-6 h-6 transition-transform" />
                      <span className="text-lg">Sign In</span>
                    </>
                  )}
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                translate-x-[-100%] group-hover:translate-x-[100%] 
                                transition-transform duration-1000 ease-out rounded-2xl"
                                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                                from-transparent via-white/40 to-transparent rounded-b-2xl" />
              </button>
          </div>
      </div>
    </div>
  );
}
