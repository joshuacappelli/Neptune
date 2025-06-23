import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { listen } from "@tauri-apps/api/event";
import { saveItem, getItem, removeItem } from "tauri-plugin-keychain";

const CLIENT_ID     = import.meta.env.VITE_GH_CLIENT_ID!;
const CLIENT_SECRET = import.meta.env.VITE_GH_SECRET!;   // never shipped to web

function makeState() {
  return crypto.getRandomValues(new Uint8Array(16))
               .reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");
}

export async function githubLogin() {
  const state = makeState();
  const port  = await invoke<number>("start_oauth", { state });

  const stop = await listen<string>("github_code", async (ev) => {
    stop();
    const code = ev.payload;

    // exchange code -> token INSIDE Rust
    const token: string = await invoke(
      "exchange_code",
      { code, clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }
    );

    await saveItem("gh_token", token);           // key-chain persist
  });

  const redirect = `http://127.0.0.1:${port}/callback`;
  const url = `https://github.com/login/oauth/authorize?` +
    new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: redirect, scope: "repo read:org", state });

  await open(url);
}

export async function tryAutoLogin(): Promise<boolean> {
  const token = await getItem("gh_token").catch(() => null);
  if (!token) return false;

  const ok = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${token}` }
  }).then(r => r.ok);

  if (!ok) await removeItem("gh_token");
  return ok;
}

export async function logout() {
  await removeItem("gh_token");
}
