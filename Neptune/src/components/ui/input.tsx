import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative group">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/10 to-transparent opacity-50 blur-[0.5px]" />
        <input
          type={type}
          className={cn(
            "relative w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
            "bg-gray-800/40 backdrop-blur-md",
            "border border-white/10",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
            "placeholder:text-gray-400",
            "text-white",
            "hover:bg-gray-800/50",
            "focus:bg-gray-800/60",
            error && "border-red-500/50 focus:ring-red-500/30",
            className
          )}
          ref={ref}
          {...props}
        />
        <div 
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            "bg-gradient-to-b from-white/10 to-transparent opacity-30",
            "transition-opacity duration-200",
            "group-focus-within:opacity-0"
          )}
        />
        <div 
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            "bg-gradient-to-b from-transparent to-black/20 opacity-50",
            "transition-opacity duration-200",
            "group-focus-within:opacity-0"
          )}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
