#[derive(Debug, Clone)]
pub struct Learner {
    display_name: String,
}

impl Learner {
    pub fn new(name: &str) -> Self {
        let trimmed = name.trim();
        let display_name = if trimmed.is_empty() {
            "架构师".to_string()
        } else {
            trimmed.to_string()
        };

        Self { display_name }
    }

    pub fn display_name(&self) -> &str {
        &self.display_name
    }
}
