import { RepositoryCard } from "./RepositoryCard"
import type { Repository } from "../types/Repository"

interface RepositoryGridProps {
  repositories: Repository[]
}

export function RepositoryGrid({ repositories }: RepositoryGridProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Your Repositories</h2>
        <p className="text-muted-foreground text-white">Manage and monitor your repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
      </div>
    </div>
  )
}
