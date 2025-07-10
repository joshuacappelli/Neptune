import { useState } from "react"
import { Sidebar } from "./SideBar"
import { RepositoryGrid } from "./Repository-Grid"
import { AddRepositoryModal } from "./AddRepoModal"
import { AddExistingRepoModal } from "./AddExistingRepoModal"
import { DashboardHeader } from "./DashboardHeader"
import { useNeptuneStore } from "../store"
import { Plus, GitBranch, FolderGit2, Github } from "lucide-react"

export function Dashboard() {
  const [isAddRepoModalOpen, setIsAddRepoModalOpen] = useState(false)
  const [isCreateRepoModalOpen, setIsCreateRepoModalOpen] = useState(false)
  const { local, addRepo } = useNeptuneStore()
  
  // Convert local repos to Repository format for the grid
  const repositories = Object.entries(local).map(([id, repo]) => ({
    id,
    name: repo.repoName,
    owner: "local", // You might want to extract owner from repo name
    description: `Local repository: ${repo.repoName}`,
    stars: 0,
    forks: 0,
    issues: 0,
    pullRequests: 0,
    lastUpdated: new Date().toISOString(),
    language: "Unknown",
    visibility: "private" as const,
    status: "healthy" as const,
  }))

  const addRepository = (repository: any) => {
    // This would need to be adapted based on your actual repository structure
    addRepo(repository.id, repository.name)
    setIsAddRepoModalOpen(false)
  }

  const createRepository = (repository: any) => {
    // Handle creating a new repository
    addRepo(repository.id, repository.name)
    setIsCreateRepoModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader onAddRepository={() => setIsAddRepoModalOpen(true)} />
        <div className="container mx-auto px-6 py-8">
          {repositories.length > 0 ? (
            <RepositoryGrid repositories={repositories} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              {/* Animated Background */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center">
                  <FolderGit2 className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                No Repositories Yet
              </h2>
              
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                Get started by adding an existing repository or creating a new one. Neptune will help you visualize your git workflows and manage your codebase.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setIsAddRepoModalOpen(true)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 p-[2px] hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
                >
                  <div className="relative flex items-center space-x-3 bg-black rounded-2xl px-6 py-4 font-semibold text-white">
                    <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Add Existing Repository</span>
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  translate-x-[-100%] group-hover:translate-x-[100%] 
                                  transition-transform duration-1000 ease-out rounded-2xl" />
                </button>

                <button
                  onClick={() => setIsCreateRepoModalOpen(true)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-[2px] hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <div className="relative flex items-center space-x-3 bg-black rounded-2xl px-6 py-4 font-semibold text-white">
                    <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Create New Repository</span>
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  translate-x-[-100%] group-hover:translate-x-[100%] 
                                  transition-transform duration-1000 ease-out rounded-2xl" />
                </button>
              </div>
              
              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <GitBranch className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Visual Git History</h3>
                  <p className="text-sm text-gray-400 text-center">See your commit history in an intuitive graph view</p>
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-black text-xs font-bold">AI</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Smart Reviews</h3>
                  <p className="text-sm text-gray-400 text-center">AI-powered code reviews and suggestions</p>
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-white text-xs font-bold">⚡</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Real-time Sync</h3>
                  <p className="text-sm text-gray-400 text-center">Stay in sync with your team's changes</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <AddExistingRepoModal
          isOpen={isAddRepoModalOpen}
          onClose={() => setIsAddRepoModalOpen(false)}
          onAdd={addRepository}
        />
        <AddRepositoryModal
          isOpen={isCreateRepoModalOpen}
          onClose={() => setIsCreateRepoModalOpen(false)}
          onAdd={createRepository}
        />
      </main>
    </div>
  )
}
