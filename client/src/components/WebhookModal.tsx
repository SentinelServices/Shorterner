import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CyberButton } from "./CyberButton";
import { useSetting, useUpdateSetting } from "@/hooks/use-settings";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function WebhookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: webhookUrlSetting } = useSetting("webhook_url");
  const { data: webhookEnabledSetting } = useSetting("webhook_enabled");
  
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();

  useEffect(() => {
    if (webhookUrlSetting) setUrl(webhookUrlSetting.value);
    if (webhookEnabledSetting) setEnabled(webhookEnabledSetting.value === "true");
  }, [webhookUrlSetting, webhookEnabledSetting]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: "webhook_url", value: url });
      await updateSetting.mutateAsync({ key: "webhook_enabled", value: String(enabled) });
      
      toast({
        title: "Configuration Saved",
        description: "Webhook settings have been updated.",
        className: "bg-black border-primary text-primary font-mono",
      });
      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border border-primary/20 text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary tracking-widest flex items-center gap-2">
            <Settings className="w-5 h-5" /> SYSTEM CONFIGURATION
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-white/10 bg-white/5">
              <div className="space-y-1">
                <h4 className="font-display text-sm text-primary">Active Reporting</h4>
                <p className="text-xs text-muted-foreground">Send scan results to configured endpoint</p>
              </div>
              <Switch 
                checked={enabled}
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase">Webhook Endpoint</label>
              <div className="relative">
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-webhook.com/..."
                  className="bg-black border-white/20 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary h-12"
                />
                <div className="absolute right-3 top-3 text-muted-foreground">
                  {url && (url.startsWith("http") ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <AlertCircle className="w-5 h-5 text-red-500" />)}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">
                * Data is sent as JSON via POST request
              </p>
            </div>
          </div>

          <CyberButton 
            onClick={handleSave} 
            isLoading={updateSetting.isPending}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" /> Commit Changes
          </CyberButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
