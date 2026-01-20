import { ReactNode } from "react";

interface DataFieldProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  isMonospace?: boolean;
}

export function DataField({ label, value, icon, isMonospace = true }: DataFieldProps) {
  return (
    <div className="flex flex-col gap-1 p-3 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span className="text-xs uppercase font-display tracking-wider">{label}</span>
      </div>
      <div className={`text-lg truncate ${isMonospace ? 'font-mono text-primary' : 'font-sans text-foreground'}`}>
        {value || <span className="text-muted-foreground/50 text-sm">N/A</span>}
      </div>
    </div>
  );
}
