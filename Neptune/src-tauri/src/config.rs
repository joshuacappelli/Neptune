use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, process::Command};

#[derive(Serialize, Deserialize)]
pub struct Config {
    pub author_name: String,
    pub author_email: String,
}

impl Config {
    pub fn path(dir: &str) -> PathBuf {
        PathBuf::from(dir).join("config.json")
    }

    pub fn load(dir: &str) -> Option<Self> {
        let content = fs::read_to_string(Self::path(dir)).ok()?;
        serde_json::from_str(&content).ok()
    }

    pub fn save(&self, dir: &str) -> Result<(), String> {
        let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(Self::path(dir), content).map_err(|e| e.to_string())
    }

    pub fn try_git_defaults() -> (Option<String>, Option<String>) {
        let name = Command::new("git")
            .args(["config", "--get", "user.name"])
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string());

        let email = Command::new("git")
            .args(["config", "--get", "user.email"])
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string());

        (name, email)
    }
}
