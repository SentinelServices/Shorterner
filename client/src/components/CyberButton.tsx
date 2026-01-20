import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export function CyberButton({ 
  children, 
  className, 
  variant = "primary", 
  isLoading, 
  disabled,
  ...props 
}: CyberButtonProps) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary hover:bg-primary hover:text-black hover:glow-primary",
    secondary: "bg-secondary/10 text-secondary border-secondary hover:bg-secondary hover:text-black",
    danger: "bg-destructive/10 text-red-500 border-red-500 hover:bg-red-500 hover:text-white hover:glow-danger",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "relative px-8 py-3 border font-display uppercase tracking-widest text-sm transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden",
        "clip-path-slant", // We'll need to define this or just use standard shapes
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <span className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
      
      {/* Glitch effect overlay on hover */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-12 transition-transform duration-700 ease-in-out" />
    </button>
  );
}
