import { useState } from "react"
import { Sidebar } from "./SideBar"
import { RepositoryGrid } from "./Repository-Grid"
import { AddRepositoryModal } from "./AddRepoModal"
import { DashboardHeader } from "./DashboardHeader"
import type { Repository } from "../types/Repository"

export function Dashboard() {
  const [isAddRepoModalOpen, setIsAddRepoModalOpen] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: "1",
      name: "neptune-core",
      owner: "neptune",
      description: "Core functionality for Neptune platform",
      stars: 128,
      forks: 32,
      issues: 8,
      pullRequests: 5,
      lastUpdated: "2023-06-10T10:23:00Z",
      language: "TypeScript",
      visibility: "private",
      status: "healthy",
    },
    {
      id: "2",
      name: "neptune-ui",
      owner: "neptune",
      description: "UI components for Neptune applications",
      stars: 256,
      forks: 48,
      issues: 12,
      pullRequests: 7,
      lastUpdated: "2023-06-08T14:45:00Z",
      language: "TypeScript",
      visibility: "public",
      status: "warning",
    },
    {
      id: "3",
      name: "neptune-docs",
      owner: "neptune",
      description: "Documentation for Neptune platform",
      stars: 64,
      forks: 16,
      issues: 3,
      pullRequests: 2,
      lastUpdated: "2023-06-05T09:15:00Z",
      language: "MDX",
      visibility: "public",
      status: "healthy",
    },
  ])

  const addRepository = (repository: Repository) => {
    setRepositories([...repositories, repository])
    setIsAddRepoModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader onAddRepository={() => setIsAddRepoModalOpen(true)} />
        <div className="container mx-auto px-6 py-8">
          <RepositoryGrid repositories={repositories} />
        </div>
        <AddRepositoryModal
          isOpen={isAddRepoModalOpen}
          onClose={() => setIsAddRepoModalOpen(false)}
          onAdd={addRepository}
        />
      </main>
    </div>
  )
}
