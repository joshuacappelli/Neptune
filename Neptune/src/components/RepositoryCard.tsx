import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import type { Repository } from "../types/Repository"
import { formatDistanceToNow } from "date-fns"
import { Code, GitBranch, GitFork, MoreHorizontal, Star, AlertCircle, CheckCircle2, Lock, Globe } from "lucide-react"

interface RepositoryCardProps {
  repository: Repository
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const lastUpdated = formatDistanceToNow(new Date(repository.lastUpdated), { addSuffix: true })
  const navigate = useNavigate()
  
  return (
    <Card className="repo-card overflow-hidden border border-white/10 bg-gray-900/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:border-blue-500/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg leading-none text-white">{repository.name}</h3>
            {repository.visibility === "private" ? (
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <Globe className="h-3.5 w-3.5 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-300">{repository.owner}</p>
        </div>
        <div className="flex items-center gap-2">
          {repository.status === "healthy" ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Healthy
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              <AlertCircle className="mr-1 h-3 w-3" />
              Warning
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800/50">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900/95 backdrop-blur-md border-gray-800">
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/50">
              <button onClick={() => navigate("/setting")}>Setting</button>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/50">View Repository</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/50">Clone Repository</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/50">View Issues</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-gray-800/50">Remove Repository</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-300 line-clamp-2 h-10">{repository.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Code className="h-3.5 w-3.5" />
            <span>{repository.language}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Star className="h-3.5 w-3.5" />
            <span>{repository.stars}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <GitFork className="h-3.5 w-3.5" />
            <span>{repository.forks}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full justify-between items-center">
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-white hover:border-gray-600">
              <GitBranch className="mr-1 h-3.5 w-3.5" />
              {repository.pullRequests} PRs
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-gray-300 border-gray-700 hover:bg-gray-800/50 hover:text-white hover:border-gray-600">
              <AlertCircle className="mr-1 h-3.5 w-3.5" />
              {repository.issues} Issues
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
