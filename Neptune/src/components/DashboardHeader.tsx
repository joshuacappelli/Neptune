import { Bell, Plus, Search, User } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface DashboardHeaderProps {
  onAddRepository: () => void
}

export function DashboardHeader({ onAddRepository }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative ml-6 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search repositories..." 
            className="w-96 bg-gray-800/50 text-white placeholder-gray-400 pl-8 rounded-md border border-gray-700 focus:border-gray-600 focus:outline-none" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onAddRepository} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-gray-800">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-gray-800">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-white hover:bg-gray-700">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-700">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-700">Team</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-white hover:bg-gray-700">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
