import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { listen } from "@tauri-apps/api/event";
import { saveItem, getItem, removeItem } from "tauri-plugin-keychain";

/* key-chain key */
const KEY = "gh_token";

/* GitHub OAuth app secrets (kept in env / Rust) */
const CLIENT_ID     = import.meta.env.VITE_GH_CLIENT_ID!;
const CLIENT_SECRET = import.meta.env.VITE_GH_SECRET!;

/* ---------- token helpers ---------- */
export const saveToken = (t: string) => saveItem(KEY, t);
export const loadToken = ()          => getItem(KEY).catch(() => null);
export const wipeToken = ()          => removeItem(KEY).catch(() => {});

/* ---------- Check for existing token without starting OAuth ---------- */
export async function checkExistingToken(): Promise<string | null> {
  const token = await loadToken();
  if (!token) return null;

  // Validate token
  const ok = await fetch("https://api.github.com/user", {
    headers:{ Authorization:`token ${token}` }
  }).then(r => r.ok);

  if (!ok) {
    await wipeToken();
    return null;
  }
  return token;
}

/* ---------- OAuth helpers ---------- */
const randomState = () =>
  crypto.getRandomValues(new Uint8Array(16))
        .reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");

export async function loginWithGitHub() {
  const state = randomState();
  const port  = await invoke<number>("start_oauth", { state });

  const stop = await listen<string>("github_code", async ({ payload }) => {
    stop();
    const token: string = await invoke("exchange_code", {
      code: payload,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    await saveToken(token);
    window.location.reload();
  });

  const redirect = `http://localhost:${port}/callback`;
  const url = "https://github.com/login/oauth/authorize?" +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirect,
      scope: "repo read:org",
      state,
    });

  await open(url);
}

/* ---------- boot-time guard ---------- */
export async function ensureAuth(): Promise<string | null> {
  const token = await loadToken();
  if (!token) { await loginWithGitHub(); return null; }

  const ok = await fetch("https://api.github.com/user", {
    headers:{ Authorization:`token ${token}` }
  }).then(r => r.ok);

  if (!ok) { await wipeToken(); await loginWithGitHub(); return null; }
  return token;
}

/* ---------- logout ---------- */
export async function logout() {
  await wipeToken();
  window.location.href = "/";
}
