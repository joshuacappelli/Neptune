import { supabase } from "./lib/supabase";
import { saveItem, getItem, removeItem } from "tauri-plugin-keychain";

/* key-chain slot */
const KEY = "gh_token";

/* ---------- key-chain helpers ---------- */
export const saveToken  = (t: string) => saveItem(KEY, t);
export const loadToken  = ()          => getItem(KEY).catch(() => null);
export const wipeToken  = ()          => removeItem(KEY).catch(() => {});

/* ---------- sign-in (one pop-up) ---------- */
export async function ensureSupabaseSession() {
  let { data: { session } } = await supabase.auth.getSession();

  /* First run → open GitHub OAuth (Supabase handles redirect) */
  if (!session) {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo read:org",                       // PAT scopes
        redirectTo: `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback`
      }
    });
    return;       // function resumes after redirect
  }

  /* Save PAT for git operations */
  if (session.provider_token) await saveToken(session.provider_token);
}

/* keep PAT up-to-date after silent refresh */
supabase.auth.onAuthStateChange((_evt, session) => {
  if (session?.provider_token) saveToken(session.provider_token);
});

/* ---------- check existing PAT without pop-up ---------- */
export async function checkExistingToken(): Promise<string | null> {
  const pat = await loadToken();
  if (!pat) return null;

  const ok = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${pat}` }
  }).then(r => r.ok);

  if (!ok) { await wipeToken(); return null; }
  return pat;
}

/* ---------- logout ---------- */
export async function logout() {
  await supabase.auth.signOut();
  await wipeToken();
  window.location.href = "/";
}
