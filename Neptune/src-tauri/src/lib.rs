// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{command, Emitter, Manager, Window};
mod config;
mod git;
use config::Config;
use git::types::CommitInfo;
use rand::distributions::Alphanumeric;
use rand::Rng;
use reqwest::Client;
use serde_json::json;
use tauri_plugin_oauth::{start_with_config, OauthConfig};
use tauri_plugin_store::StoreExt;
use url::Url;

fn random_state() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

fn verify_callback(url: &str, expected_state: &str) -> Option<String> {
    let parsed = Url::parse(url).ok()?;
    if parsed.path() != "/callback" {
        return None;
    }
    let mut code = None;
    let mut state_ok = false;

    for (k, v) in parsed.query_pairs() {
        match &*k {
            "code" => code = Some(v.into_owned()),
            "state" => state_ok = v == expected_state,
            _ => {}
        }
    }
    code.filter(|_| state_ok)
}

#[tauri::command]
async fn save_token(window: Window, key: String, value: String) -> Result<(), String> {
    let store = window
        .app_handle()
        .store("auth.json")
        .map_err(|e| e.to_string())?;

    store.set(key, json!(value));
    Ok(())
}

#[tauri::command]
async fn get_token(window: Window, key: String) -> Result<Option<String>, String> {
    let store = window
        .app_handle()
        .store("auth.json")
        .map_err(|e| e.to_string())?;

    let value = store.get(&key);

    match value {
        Some(v) => v
            .as_str()
            .map(String::from)
            .ok_or("Invalid token format".into())
            .map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
async fn remove_token(window: Window, key: String) -> Result<(), String> {
    let store = window
        .app_handle()
        .store("auth.json")
        .map_err(|e| e.to_string())?;

    store.delete(&key);
    Ok(())
}

/* ---------- command exposed to JS ---------- */
#[tauri::command]
async fn start_oauth(window: Window) -> Result<u16, String> {
    let cfg = OauthConfig {
        ports: Some(vec![8000, 8001, 8002]),
        response: Some("OAuth finished. You can close this tab.".into()),
    };

    start_with_config(cfg, move |url| {
        // For now, let's emit the code directly without state verification
        // to debug the flow
        if url.contains("code=") {
            let parsed = Url::parse(&url).ok();
            if let Some(parsed_url) = parsed {
                for (k, v) in parsed_url.query_pairs() {
                    if k == "code" {
                        let _ = window.emit("github_code", v.to_string());
                        break;
                    }
                }
            }
        }
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn exchange_code(
    code: String,
    client_id: String,
    client_secret: String,
) -> Result<String, String> {
    println!("Exchanging code: {}", code);
    println!("Client ID: {}", client_id);
    println!("Client Secret: {}", client_secret);

    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("code", code),
    ];

    let response = Client::new()
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    println!("Response status: {}", response.status());

    let json = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    println!("Response JSON: {:?}", json);

    json["access_token"]
        .as_str()
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
        .plugin(tauri_plugin_stronghold::Builder::new(|pass| todo!()).build())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            load_or_create_config,
            save_config,
            get_git_log,
            start_oauth,
            exchange_code,
            save_token,
            get_token,
            remove_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
