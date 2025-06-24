import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { listen } from "@tauri-apps/api/event";

const CLIENT_ID     = import.meta.env.VITE_GH_CLIENT_ID!;
const CLIENT_SECRET = import.meta.env.VITE_GH_SECRET!; 

function makeState() {
  return crypto.getRandomValues(new Uint8Array(16))
               .reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");
}

export async function githubLogin(): Promise<void> {
  const state = makeState();
  const port = await invoke<number>("start_oauth");

  console.log("port", port);
  console.log("CLIENT_ID:", CLIENT_ID);
  console.log("CLIENT_SECRET length:", CLIENT_SECRET?.length);

  return new Promise((resolve, reject) => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      reject(new Error("OAuth timeout - no response received"));
    }, 60000); // 60 seconds timeout

    const unsubscribe = listen<string>("github_code", async (ev) => {
      console.log("Event received:", ev);
      clearTimeout(timeout);
      try {
        const code = ev.payload;
        console.log("Received code:", code);

        // exchange code -> token INSIDE Rust
        const token: string = await invoke(
          "exchange_code",
          { code, clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }
        );

        console.log("Received token:", token);
        
        // Save token using store
        await invoke("save_token", { key: "gh_token", value: token });
        console.log("Token saved successfully");
        
        resolve();
      } catch (error) {
        console.error("Error in OAuth flow:", error);
        reject(error);
      }
    });

    const redirect = `http://localhost:${port}/callback`;
    const url = `https://github.com/login/oauth/authorize?` +
      new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: redirect, scope: "repo read:org", state });

    console.log("Opening URL:", url);
    open(url).catch((error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

export async function tryAutoLogin(): Promise<boolean> {
  const token = await invoke<string>("get_token", { key: "gh_token" }).catch(() => null);
  console.log("token", token);
  if (!token) return false;

  const ok = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${token}` }
  }).then(r => r.ok);

  if (!ok) {
    console.log("Token validation failed, removing token");
    try {
      await invoke("remove_token", { key: "gh_token" });
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }
  console.log("ok", ok);
  return ok;
}

export async function logout() {
  try {
    await invoke("remove_token", { key: "gh_token" });
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
