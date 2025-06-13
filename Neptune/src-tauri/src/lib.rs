// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod config;
mod git;
use git::types::CommitDAG;
use config::Config;

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
fn get_dag(repo_path: String) -> Result<Vec<CommitDAG>, String> {
    git::commands::get_commit_dag(&repo_path)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, load_or_create_config, save_config, get_dag])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
