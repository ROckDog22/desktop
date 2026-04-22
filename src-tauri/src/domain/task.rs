#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Task {
    id: u64,
    title: TaskTitle,
    completed: bool,
}

impl Task {
    pub fn new(id: u64, title: TaskTitle) -> Self {
        Self {
            id,
            title,
            completed: false,
        }
    }

    pub fn restore(id: u64, title: TaskTitle, completed: bool) -> Self {
        Self {
            id,
            title,
            completed,
        }
    }

    pub fn id(&self) -> u64 {
        self.id
    }

    pub fn title(&self) -> &str {
        self.title.as_str()
    }

    pub fn completed(&self) -> bool {
        self.completed
    }

    pub fn toggle(&self) -> Self {
        Self {
            id: self.id,
            title: self.title.clone(),
            completed: !self.completed,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TaskTitle(String);

impl TaskTitle {
    pub const MAX_LENGTH: usize = 80;

    pub fn new(title: &str) -> Result<Self, TaskError> {
        let trimmed = title.trim();

        if trimmed.is_empty() {
            return Err(TaskError::EmptyTitle);
        }

        if trimmed.chars().count() > Self::MAX_LENGTH {
            return Err(TaskError::TitleTooLong {
                max_length: Self::MAX_LENGTH,
            });
        }

        Ok(Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TaskError {
    EmptyTitle,
    TitleTooLong { max_length: usize },
}

impl std::fmt::Display for TaskError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyTitle => write!(f, "任务标题不能为空。"),
            Self::TitleTooLong { max_length } => {
                write!(f, "任务标题不能超过 {} 个字符。", max_length)
            }
        }
    }
}

impl std::error::Error for TaskError {}
