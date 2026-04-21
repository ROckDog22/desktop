pub mod api;
pub mod application;
pub mod domain;
pub mod infrastructure;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![api::greeting::greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
