use std::process::Command;
use crate::git::types::CommitDAG;

pub fn get_commit_dag(repo_path: &str) -> Result<Vec<CommitDAG>, String> {
    let output = Command::new("git")
        .args([
            "-C", repo_path,
            "log",
            "--pretty=format:%H|%P|%an|%ae|%at|%s"
        ])
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Err("git log failed".into());
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| format!("Invalid UTF-8: {}", e))?;

    let commits = stdout
        .lines()
        .map(|line| {
            let mut parts = line.splitn(6, '|');
            let id = parts.next().unwrap_or("").to_string();
            let parents_str = parts.next().unwrap_or("");
            let author = parts.next().unwrap_or("").to_string();
            let email = parts.next().unwrap_or("").to_string();
            let timestamp = parts.next().unwrap_or("0").parse::<u64>().unwrap_or(0);
            let message = parts.next().unwrap_or("").to_string();

            let parents = if parents_str.is_empty() {
                vec![]
            } else {
                parents_str.split_whitespace().map(|s| s.to_string()).collect()
            };

            CommitDAG {
                id,
                parents,
                author,
                email,
                timestamp,
                message,
            }
        })
        .collect();

    Ok(commits)
}
