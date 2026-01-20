import { useState } from "react";
import { Shield, Link as LinkIcon, Copy, Check, Clock, Activity, AlertTriangle, ExternalLink } from "lucide-react";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [targetUrl, setTargetUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setShortCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateLink = async () => {
    if (!targetUrl.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(api.links.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl })
      });
      if (res.ok) {
        const { code } = await res.json();
        const url = `${window.location.origin}/l/${code}`;
        setShortUrl(url);
        toast({ title: "LINK GENERATED", description: "Secure redirect created." });
      }
    } catch (e) {
      toast({ title: "ERROR", description: "Failed to create link.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setShortCopied(true);
    setTimeout(() => setShortCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Shield className="w-16 h-16 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
          </div>
          <h1 className="text-5xl font-black font-display tracking-tighter text-white uppercase italic italic-glow">
            SENTINEL.LINK
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
            Multi-Stage Connection Analysis • Secure Tunneling
          </p>
        </div>

        <CyberCard title="ENCRYPT NEW TARGET">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-primary/70 uppercase">Target Destination</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-black/50 border border-white/10 p-3 text-primary font-mono focus:border-primary/50 outline-none"
                />
                <CyberButton onClick={handleCreateLink} disabled={isCreating}>
                  {isCreating ? "ENCRYPTING..." : "CREATE"}
                </CyberButton>
              </div>
            </div>

            {shortUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <label className="text-[10px] font-mono text-primary/70 uppercase">Secure Access Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-primary/20 p-3 font-mono text-primary text-sm truncate">
                    {shortUrl}
                  </div>
                  <CyberButton onClick={copyToClipboard} variant="secondary">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </CyberButton>
                </div>
              </motion.div>
            )}
          </div>
        </CyberCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Clock />, title: "3 STAGES", desc: "90s verification" },
            { icon: <Activity />, title: "FINGERPRINT", desc: "Random hash gen" },
            { icon: <AlertTriangle />, title: "IDENTITY", desc: "Discord verified" }
          ].map((feat, i) => (
            <div key={i} className="p-4 border border-white/5 bg-white/5 text-center space-y-2">
              <div className="text-primary flex justify-center">{feat.icon}</div>
              <div className="text-[10px] font-bold font-display uppercase tracking-widest text-white">{feat.title}</div>
              <div className="text-[9px] text-muted-foreground uppercase font-mono">{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

