import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { Repository } from "../types/Repository"
import { GitFork, Loader2 } from "lucide-react"

interface AddRepositoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (repository: Repository) => void
}

export function AddRepositoryModal({ isOpen, onClose, onAdd }: AddRepositoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    description: "",
    language: "TypeScript",
    visibility: "public",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newRepo: Repository = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        owner: formData.owner,
        description: formData.description,
        stars: 0,
        forks: 0,
        issues: 0,
        pullRequests: 0,
        lastUpdated: new Date().toISOString(),
        language: formData.language,
        visibility: formData.visibility as "public" | "private",
        status: "healthy",
      }

      onAdd(newRepo)
      setIsLoading(false)
      setFormData({
        name: "",
        owner: "",
        description: "",
        language: "TypeScript",
        visibility: "public",
      })
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/30 backdrop-blur-md border border-white/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <GitFork className="h-5 w-5 text-blue-400" />
              Add Repository
            </DialogTitle>
            <DialogDescription className="text-gray-300">Add a new repository to your Neptune Operations Hub.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Repository Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. neptune-core"
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-gray-300">Owner</Label>
                <Input
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="e.g. neptune"
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the repository"
                className="resize-none bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500/50"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-300">Primary Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                  <SelectTrigger id="language" className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-gray-800">
                    <SelectItem value="TypeScript" className="text-gray-300 hover:text-white hover:bg-gray-800/50">TypeScript</SelectItem>
                    <SelectItem value="JavaScript" className="text-gray-300 hover:text-white hover:bg-gray-800/50">JavaScript</SelectItem>
                    <SelectItem value="Python" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Python</SelectItem>
                    <SelectItem value="Go" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Go</SelectItem>
                    <SelectItem value="Rust" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Rust</SelectItem>
                    <SelectItem value="Java" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Java</SelectItem>
                    <SelectItem value="C#" className="text-gray-300 hover:text-white hover:bg-gray-800/50">C#</SelectItem>
                    <SelectItem value="Other" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-gray-300">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleSelectChange("visibility", value)}>
                  <SelectTrigger id="visibility" className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-gray-800">
                    <SelectItem value="public" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Public</SelectItem>
                    <SelectItem value="private" className="text-gray-300 hover:text-white hover:bg-gray-800/50">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button" className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>Add Repository</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}