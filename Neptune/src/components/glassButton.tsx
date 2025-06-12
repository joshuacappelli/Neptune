import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function GlassButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: GlassButtonProps) {
  const baseClasses = `
    relative overflow-hidden
    font-medium text-white
    transition-all duration-300 ease-out
    backdrop-blur-md
    border border-white/20
    shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    group
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-white/10 via-white/5 to-transparent
      hover:from-white/20 hover:via-white/10 hover:to-white/5
      hover:shadow-xl hover:shadow-blue-500/20
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-br from-gray-500/20 via-gray-500/10 to-transparent
      hover:from-gray-400/30 hover:via-gray-400/15 hover:to-gray-400/5
      hover:shadow-xl hover:shadow-gray-400/20
      active:scale-95
    `,
    accent: `
      bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/10
      hover:from-blue-400/40 hover:via-purple-400/30 hover:to-cyan-400/20
      hover:shadow-xl hover:shadow-purple-500/30
      active:scale-95
      border-gradient-to-r border-blue-400/30
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      translate-x-[-100%] group-hover:translate-x-[100%] 
                      transition-transform duration-1000 ease-out" />
      
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                      from-transparent via-white/40 to-transparent" />
    </button>
  );
}

// Usage examples:
export function GlassButtonExamples() {
  return (
    <div className="min-h-screen bg-black p-8 space-y-8">
      {/* Background for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Liquid Glass Buttons</h1>
        
        {/* Size variations */}
        <div className="space-y-4">
          <h2 className="text-2xl text-white">Sizes</h2>
          <div className="flex gap-4 items-center">
            <GlassButton size="sm">Small</GlassButton>
            <GlassButton size="md">Medium</GlassButton>
            <GlassButton size="lg">Large</GlassButton>
          </div>
        </div>

        {/* Variant styles */}
        <div className="space-y-4">
          <h2 className="text-2xl text-white">Variants</h2>
          <div className="flex gap-4 flex-wrap">
            <GlassButton variant="primary">Primary</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="accent">Accent</GlassButton>
          </div>
        </div>

        {/* Interactive examples */}
        <div className="space-y-4">
          <h2 className="text-2xl text-white">Interactive</h2>
          <div className="flex gap-4 flex-wrap">
            <GlassButton onClick={() => alert('Clicked!')}>
              Click Me
            </GlassButton>
            <GlassButton disabled>
              Disabled
            </GlassButton>
            <GlassButton variant="accent" onClick={() => console.log('Action!')}>
              ✨ Special Action
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}