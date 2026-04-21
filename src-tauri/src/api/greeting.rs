use serde::Serialize;

use crate::application::greeting_service::GreetingService;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapDto {
    product_name: String,
    greeting: String,
    process_model: String,
    core_boundary: String,
    architecture_rules: Vec<&'static str>,
    next_lessons: Vec<&'static str>,
}

#[tauri::command]
pub fn greet(name: &str) -> BootstrapDto {
    let service = GreetingService::default();
    let summary = service.build_bootstrap(name);

    BootstrapDto {
        product_name: summary.product_name,
        greeting: summary.greeting,
        process_model: summary.process_model,
        core_boundary: summary.core_boundary,
        architecture_rules: summary.architecture_rules,
        next_lessons: summary.next_lessons,
    }
}
