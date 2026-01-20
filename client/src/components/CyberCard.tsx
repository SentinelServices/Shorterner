import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: "default" | "danger" | "warning";
  delay?: number;
}

export function CyberCard({ children, className, title, variant = "default", delay = 0 }: CyberCardProps) {
  const borderColor = variant === "danger" ? "border-red-500" : "border-primary/50";
  const glowClass = variant === "danger" ? "hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]";
  const titleColor = variant === "danger" ? "text-red-500" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative bg-black/40 backdrop-blur-md border border-t-2 p-6 transition-all duration-300",
        borderColor,
        glowClass,
        className
      )}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-white/80" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-white/80" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-white/80" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-white/80" />

      {title && (
        <div className="mb-4 flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse bg-current", titleColor)} />
          <h3 className={cn("font-display text-sm uppercase tracking-widest", titleColor)}>
            {title}
          </h3>
          <div className="flex-1 h-px bg-white/10 ml-2" />
        </div>
      )}
      
      {children}
    </motion.div>
  );
}
