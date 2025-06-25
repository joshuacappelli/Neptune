use tauri::{Window,Emitter, Manager};
use reqwest::Client;
use tauri_plugin_oauth::{OauthConfig, start_with_config};
use url::Url;

/* ───── verify ?code & ?state ───── */
fn verify(url: &str, expected_state: &str) -> Option<String> {
    let url = Url::parse(url).ok()?;
    if url.path() != "/callback" { return None; }

    let mut code = None;
    let mut ok   = false;
    for (k, v) in url.query_pairs() {
        match &*k {
            "code"  => code = Some(v.into_owned()),
            "state" => ok   = v == expected_state,
            _ => {}
        }
    }
    code.filter(|_| ok)
}

/* ───── commands ───── */
#[tauri::command]
async fn start_oauth(window: Window, state: String) -> Result<u16, String> {
    let cfg = OauthConfig {
        ports: Some(vec![8000, 8001, 8002]),     // Multiple ports to avoid conflicts
        response: Some("OAuth finished. You may close this tab.".into()),
    };

    start_with_config(cfg, move |url| {
        if let Some(code) = verify(&url, &state) {
            let _ = window.emit("github_code", code);
        }
    }).map_err(|e| e.to_string())
}

#[tauri::command]
async fn exchange_code(code: String, client_id: String, client_secret: String)
    -> Result<String, String>
{
    let resp = Client::new()
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("code", code),
        ])
        .send().await.map_err(|e| e.to_string())?
        .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;

    resp["access_token"].as_str()
        .map(String::from)
        .ok_or("no token".into())
}

/* ───── entry point ───── */
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_keychain::init())          // ← key-chain plugin
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_shell::init())      // Add shell plugin
        .invoke_handler(tauri::generate_handler![
            start_oauth,
            exchange_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
