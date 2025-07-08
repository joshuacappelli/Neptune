use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_keychain::init())   // keep PAT encrypted
        .plugin(tauri_plugin_shell::init())      // if you use shell open()
        .invoke_handler(tauri::generate_handler![]) // no custom commands needed
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
