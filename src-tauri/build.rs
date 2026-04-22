fn main() {
    let attributes = tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "get_todo_board",
            "add_todo",
            "toggle_todo",
            "delete_todo",
        ]),
    );

    tauri_build::try_build(attributes).expect("failed to run Tauri build helpers");
}
