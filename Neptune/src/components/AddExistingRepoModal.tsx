import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { GitBranch, Star, GitFork, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react"
import { loadToken } from "../oauth"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

interface AddExistingRepoModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (repo: any) => void
}

export function AddExistingRepoModal({ isOpen, onClose, onAdd }: AddExistingRepoModalProps) {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchUserRepositories()
    }
  }, [isOpen])

  const fetchUserRepositories = async () => {
    setLoading(true)
    try {
      const token = await loadToken()
      if (!token) {
        console.error("No GitHub token found")
        return
      }

      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const repos = await response.json()
      setRepositories(repos)
    } catch (error) {
      console.error("Failed to fetch repositories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepoSelect = (repoId: string) => {
    const repo = repositories.find(r => r.id.toString() === repoId)
    setSelectedRepo(repo || null)
  }

  const handleAddRepository = () => {
    if (selectedRepo) {
      onAdd({
        id: selectedRepo.id.toString(),
        name: selectedRepo.name,
        full_name: selectedRepo.full_name,
        description: selectedRepo.description,
        private: selectedRepo.private,
        stars: selectedRepo.stargazers_count,
        forks: selectedRepo.forks_count,
        language: selectedRepo.language,
        lastUpdated: selectedRepo.updated_at,
        owner: selectedRepo.owner.login
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Add Existing Repository
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-6">
          {/* Repository Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Repository
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-8 border rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Loading repositories...</span>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border rounded-lg">
                No repositories found.
              </div>
            ) : (
              <Select onValueChange={handleRepoSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a repository..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{repo.name}</span>
                          {repo.private ? (
                            <EyeOff className="w-3 h-3 text-gray-400" />
                          ) : (
                            <Eye className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Repository Details */}
          {selectedRepo && (
            <Card className="border-2 border-blue-200 bg-blue-50/10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedRepo.name}
                      {selectedRepo.private ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {selectedRepo.full_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRepo.private ? "secondary" : "default"}>
                      {selectedRepo.private ? "Private" : "Public"}
                    </Badge>
                    {selectedRepo.language && (
                      <Badge variant="outline">{selectedRepo.language}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedRepo.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {selectedRepo.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{selectedRepo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{selectedRepo.forks_count}</span>
                  </div>
                  <span>Updated {new Date(selectedRepo.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddRepository}
            disabled={!selectedRepo}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Add Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 