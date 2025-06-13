use serde::Serialize;

#[derive(Serialize)]
pub struct CommitDAG {
    pub id: String,
    pub parents: Vec<String>,
    pub author: String,
    pub email: String,
    pub timestamp: u64,
    pub message: String,
}
