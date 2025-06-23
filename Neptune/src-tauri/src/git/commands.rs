use crate::git::types::CommitInfo;
use git2::{Repository, Sort};

pub fn get_git_log(path: String) -> Result<Vec<CommitInfo>, String> {
    let repo = Repository::open(path).map_err(|e| e.to_string())?;
    let mut revwalk = repo.revwalk().map_err(|e| e.to_string())?;

    revwalk
        .set_sorting(Sort::TOPOLOGICAL)
        .map_err(|e| e.to_string())?;
    revwalk.push_head().map_err(|e| e.to_string())?;

    let mut commits = vec![];

    for oid in revwalk {
        let oid = oid.map_err(|e| e.to_string())?;
        let commit = repo.find_commit(oid).map_err(|e| e.to_string())?;

        commits.push(CommitInfo {
            id: commit.id().to_string(),
            message: commit.summary().unwrap_or("").to_string(),
            author: format!("{}", commit.author()),
            timestamp: commit.time().seconds(),
            parents: commit.parent_ids().map(|p| p.to_string()).collect(),
        });
    }

    Ok(commits)
}
