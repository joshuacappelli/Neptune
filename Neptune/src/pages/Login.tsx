import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { githubLogin, tryAutoLogin } from "../oauth";

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await tryAutoLogin();
      if (isAuthenticated) {
        console.log("isAuthenticated", isAuthenticated);
        navigate("/home");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await githubLogin();
      // OAuth flow completed successfully, navigate to home
      navigate("/home");
    } catch (error) {
      console.error("GitHub login failed:", error);
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes("timeout")) {
        alert("OAuth timeout. Please try again.");
      } else {
        alert("Login failed. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Neptune</h1>
          <p className="text-gray-300 text-lg">
            Your Git Operations Hub
          </p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGitHubLogin}
            disabled={isLoggingIn}
            className="group relative w-full overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-700/90 to-gray-800/90 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-500/25">
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  <span>Continue with GitHub</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            translate-x-[-100%] group-hover:translate-x-[100%] 
                            transition-transform duration-1000 ease-out rounded-2xl" />
          </button>

          <p className="text-center text-gray-400 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 