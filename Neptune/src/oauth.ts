import { supabase } from "./lib/supabase";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { open } from "@tauri-apps/plugin-shell";
import { useNeptuneStore } from "./store";
import { getItem, saveItem, removeItem } from "tauri-plugin-keychain";

const KEY = "gh_token";

export const saveToken = async (token: string) => {
  console.log("saving token: " + token);
  try {
    await saveItem(KEY, token);  
    console.log("token saved successfully");
  } catch (error) {
    console.error("Failed to save token:", error);
  }
}

export const loadToken = async (): Promise<string | null> => {
  try {
    return await getItem(KEY);  
  } catch (error) {
    console.error("Failed to load token:", error);
    return null;
  }
};

export const wipeToken = async (): Promise<void> => {
  try {
    await removeItem(KEY); 
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
};


export async function ensureSupabaseSession(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    console.log("Existing session found");
    // Only save provider token if we don't already have one
    if (session.provider_token) {
      const existingToken = await loadToken();
      if (!existingToken) {
        console.log("Saving provider token");
        await saveToken(session.provider_token);
      }
    }
    return;
  }

  await new Promise<void>(async (resolve, reject) => {
    const unlisten = await onOpenUrl((urls) => {
      const url = urls[0]; // Get the first URL
      console.log("Deep link received: " + url);
      try {
        const fragment = url.split("#")[1] || "";
        const params = new URLSearchParams(fragment);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const providerToken = params.get("provider_token");

        if (accessToken && refreshToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          }).then(async () => {
            // Only save provider token if we don't already have one
            if (providerToken) {
              const existingToken = await loadToken();
              if (!existingToken) {
                console.log("Saving provider token if we dont have one");
                await saveToken(providerToken);
              }
            }
            
            // Create or update user in our users table
            await createOrUpdateUser();
            
            unlisten();
            resolve();
          }).catch((err) => {
            console.error("Failed to set session:", err);
            unlisten();
            reject(err);
          });
        } else {
          console.error("Missing tokens in callback URL");
          unlisten();
          reject(new Error("Tokens missing in OAuth callback URL."));
        }
      } catch (err) {
        console.error("Error processing deep link:", err);
        unlisten();
        reject(err);
      }
    });

    try {
      await initiateOAuth();
    } catch (err) {
      console.error("Failed to initiate OAuth:", err);
      unlisten();
      reject(err);
    }
  });
}

async function initiateOAuth() {
  console.log("initiating oauth")
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo read:org",
      redirectTo: "Neptune://auth/callback",
    }
  });

  if (error) throw error;
  if (data.url) {
    await open(data.url);
  } else {
    throw new Error("No OAuth URL returned from Supabase.");
  }
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.provider_token) {
    // Only save if we don't already have a token
    const existingToken = await loadToken();
    if (!existingToken) {
      console.log("Saving provider token if we dont have one in onAuthStateChange");
      await saveToken(session.provider_token);
    }
  }
  
  // Create or update user when session is established
  if (event === 'SIGNED_IN' && session) {
    await createOrUpdateUser();
  }
});

export async function checkExistingToken(): Promise<string | null> {
  const pat = await loadToken();
  if (!pat) return null;

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${pat}` }
    });
    if (!res.ok) {
      await wipeToken();
      return null;
    }
    return pat;
  } catch {
    await wipeToken();
    return null;
  }
}

async function createOrUpdateUser() {
  try {
    console.log("=== createOrUpdateUser started ===");
    
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

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  await wipeToken();
  
  // Clear the store
  const store = useNeptuneStore.getState();
  store.clear();
  
  window.location.href = "/";
}
