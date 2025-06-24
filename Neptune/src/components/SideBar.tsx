import type React from "react"
import { cn } from "../lib/utils"
import {
  LayoutDashboard,
  GitBranch,
  Code2,
  GitPullRequestIcon as PullRequest,
  Bot,
  Settings,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { logout } from "../oauth"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  href: string
  collapsed?: boolean
}

function SidebarItem({ icon, label, active, href, collapsed }: SidebarItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
        active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white",
        collapsed && "justify-center"
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </a>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div 
      className={cn(
        "h-full border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-gray-800 px-4 justify-between shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="rounded-full bg-blue-600 p-1 shrink-0">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white truncate">Neptune</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-0 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <SidebarItem icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active href="/" collapsed={collapsed} />
            <SidebarItem icon={<GitBranch className="h-4 w-4" />} label="Repositories" href="/repositories" collapsed={collapsed} />
            <SidebarItem icon={<Code2 className="h-4 w-4" />} label="Code Review" href="/code-review" collapsed={collapsed} />
            <SidebarItem icon={<PullRequest className="h-4 w-4" />} label="Pull Requests" href="/pull-requests" collapsed={collapsed} />
            <SidebarItem icon={<Bot className="h-4 w-4" />} label="AI Assistant" href="/assistant" collapsed={collapsed} />
            <SidebarItem icon={<BarChart3 className="h-4 w-4" />} label="Analytics" href="/analytics" collapsed={collapsed} />
            <SidebarItem icon={<Users className="h-4 w-4" />} label="Team" href="/team" collapsed={collapsed} />
            <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" href="/settings" collapsed={collapsed} />
          </nav>
        </div>
        <div className="mt-auto border-t border-gray-800 p-4 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer w-full",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Log out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
