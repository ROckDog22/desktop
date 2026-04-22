use tauri::Manager;

pub mod api;
pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_state = state::AppState::new(app.path().app_data_dir()?)?;
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::greeting::greet,
            api::todo::get_todo_board,
            api::todo::add_todo,
            api::todo::toggle_todo,
            api::todo::delete_todo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
