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