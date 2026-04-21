use crate::domain::learner::Learner;
use crate::infrastructure::app_metadata::product_name;

pub struct BootstrapSummary {
    pub product_name: String,
    pub greeting: String,
    pub process_model: String,
    pub core_boundary: String,
    pub architecture_rules: Vec<&'static str>,
    pub next_lessons: Vec<&'static str>,
}

#[derive(Default)]
pub struct GreetingService;

impl GreetingService {
    pub fn build_bootstrap(&self, name: &str) -> BootstrapSummary {
        let learner = Learner::new(name);

        BootstrapSummary {
            product_name: product_name(),
            greeting: format!(
                "你好，{}。这条问候来自 Rust Core，而不是前端假数据。",
                learner.display_name()
            ),
            process_model:
                "Tauri 的最小心智模型是：WebView 渲染界面，Rust Core 管系统能力，两者通过 IPC 对话。"
                    .to_string(),
            core_boundary:
                "这一课故意让 command 保持很薄，只负责协议适配；真正的语义在 application 和 domain。"
                    .to_string(),
            architecture_rules: vec![
                "Command 只做边界适配",
                "Application 负责用例编排",
                "Domain 不依赖 Tauri",
            ],
            next_lessons: vec![
                "把 greet 替换成 Todo 用例",
                "引入 Repository 抽象",
                "接上本地 JSON 持久化",
            ],
        }
    }
}
