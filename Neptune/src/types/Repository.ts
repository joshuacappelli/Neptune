export interface Repository {
    id: string
    name: string
    owner: string
    description: string
    stars: number
    forks: number
    issues: number
    pullRequests: number
    lastUpdated: string
    language: string
    visibility: "public" | "private"
    status: "healthy" | "warning" | "error"
  }

  export interface Commit {
    id: string
    message: string
    author: string
    timestamp: number
    parents: string[]
  }

  export type RepoID = string;

  export interface GitCommit {
    commit:       string;   // SHA
    parents:      string[];
    branches:     string[];
    author:       string;   // "Jane <jane@…>"
    date:         string;   // ISO 8601
    message:      string;
    changedFiles: { file: string; changes: number; insertions: number; deletions: number }[];
  }

  export interface User {
    id: number;
    login: string;
    avatarUrl: string;
    name?: string;
    email?: string;
  }

  export interface SessionSlice {
    /* state */
    user?: User;
    plan: 'free' | 'pro';
    hasToken: boolean;
  
    /* actions */
    setUser(u: User): void;
    setPlan(p: 'free' | 'pro'): void;
    setHasToken(v: boolean): void;
    clear(): void;
  }

  export interface LocalRepo {
    repoName:   string;
    localPath?: string;
    commitDag?: GitCommit[];
    commitMap?: Record<string, GitCommit>;   // ← fast lookup, NOT persisted
    authorList: string[];
    isWatching: boolean;
  }

  export interface LocalReposSlice {
    local: Record<RepoID, LocalRepo>;
  
    addRepo(id: RepoID, name: string): void;
    linkPath(id: RepoID, path: string): void;
    setDag(id: RepoID, dag: GitCommit[]): void;
    setAuthorList(id: RepoID, authors: string[]): void;
    setWatching(id: RepoID, on: boolean): void;
  
    /** constant-time commit lookup */
    getCommit(id: RepoID, sha: string): GitCommit | undefined;
  }

  /* ────────────────────────────
   4.  UI / SIDEBAR + TABS SLICE
   ──────────────────────────── */
export interface UiSlice {
  /* sidebar */
  selectedRepos: RepoID[];

  addRepoToUI(id: RepoID): void;
  removeRepoFromUI(id: RepoID): void;

  /* tabs */
  openTabs: RepoID[];
  activeTab?: RepoID;

  openTab(id: RepoID): void;
  closeTab(id: RepoID): void;
  setActive(id: RepoID): void;
  moveTab(id: RepoID, newIndex: number): void;
}