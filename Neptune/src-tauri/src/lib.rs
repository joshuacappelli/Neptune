// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{ Emitter, Window};
mod config;
mod git;
use config::Config;
use git::types::CommitInfo;
use rand::Rng;
use rand::distributions::Alphanumeric;
use url::Url;
use reqwest::Client;

use tauri_plugin_oauth::{start_with_config, OauthConfig};

fn random_state() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

fn verify_callback(url: &str, expected_state: &str) -> Option<String> {
    let parsed = Url::parse(url).ok()?;
    if parsed.path() != "/callback" { return None; }
    let mut code = None;
    let mut state_ok = false;

    for (k, v) in parsed.query_pairs() {
        match &*k {
            "code"  => code = Some(v.into_owned()),
            "state" => state_ok = v == expected_state,
            _ => {}
        }
    }
    code.filter(|_| state_ok)
}

/* ---------- command exposed to JS ---------- */
#[tauri::command]
async fn start_oauth(window: Window) -> Result<u16, String> {
    let state = random_state();            // ① generate & capture

    let cfg = OauthConfig {
        ports: Some(vec![8000, 8001, 8002]),
        response: Some("OAuth finished. You can close this tab.".into()),
    };

    start_with_config(cfg, move |url| {      // ② start server
        if let Some(code) = verify_callback(&url, &state) {
            // emit only the *code*, not the whole URL
            let _ = window.emit("github_code", code);
        }
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn exchange_code(code: String, client_id: String, client_secret: String)
  -> Result<String, String>
{
    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("code", code),
    ];
    let json = Client::new()
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&params)
        .send().await.map_err(|e| e.to_string())?
        .json::<serde_json::Value>().await.map_err(|e| e.to_string())?;

    json["access_token"].as_str()
        .map(String::from)
        .ok_or("no token".into())
}

/* ---------- End of OAuth ---------- */


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn load_or_create_config(config_dir: String) -> Config {
    if let Some(existing) = Config::load(&config_dir) {
        return existing;
    }

    let (name, email) = Config::try_git_defaults();

    let config = Config {
        author_name: name.unwrap_or_default(),
        author_email: email.unwrap_or_default(),
    };

    let _ = config.save(&config_dir);
    config
}

#[tauri::command]
async fn save_config(config_dir: String, config: Config) -> Result<(), String> {
    config.save(&config_dir)
}

#[tauri::command]
async fn get_git_log(repo_path: String) -> Result<Vec<CommitInfo>, String> {
    git::commands::get_git_log(repo_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_keychain::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            load_or_create_config,
            save_config,
            get_git_log,
            start_oauth,
            exchange_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
