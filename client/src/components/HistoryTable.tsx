import { useVisits } from "@/hooks/use-visits";
import { format } from "date-fns";
import { Shield, ShieldAlert, Smartphone, Monitor } from "lucide-react";

export function HistoryTable() {
  const { data: visits, isLoading } = useVisits();

  if (isLoading) return <div className="h-48 flex items-center justify-center font-mono text-primary animate-pulse">LOADING LOGS...</div>;

  if (!visits || visits.length === 0) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground">NO SCAN HISTORY FOUND</div>;

  return (
    <div className="overflow-x-auto border border-white/10 bg-black/40">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 font-display text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-4">Timestamp</th>
            <th className="p-4">IP Address</th>
            <th className="p-4">Location</th>
            <th className="p-4">Type</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-mono">
          {visits.slice(0, 10).map((visit) => (
            <tr key={visit.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4 text-muted-foreground">
                {visit.timestamp ? format(new Date(visit.timestamp), 'HH:mm:ss dd/MM') : '-'}
              </td>
              <td className="p-4 text-primary">{visit.ip}</td>
              <td className="p-4">{visit.city}, {visit.country}</td>
              <td className="p-4 flex items-center gap-2">
                {visit.isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                <span className="opacity-70">{visit.deviceType || 'Unknown'}</span>
              </td>
              <td className="p-4">
                {visit.isProxy ? (
                  <span className="flex items-center gap-1 text-red-500">
                    <ShieldAlert className="w-4 h-4" /> PROXY
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-primary">
                    <Shield className="w-4 h-4" /> SECURE
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
