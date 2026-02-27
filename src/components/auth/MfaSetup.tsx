"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react";

export function MfaSetup() {
  const { enrollMfa, verifyMfa, unenrollMfa, listMfaFactors } = useAuth();
  const [factor, setFactor] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCode, setBackupCode] = useState("ABCD-1234-EFGH-5678"); // Mock for now if Supabase doesn't provide it directly in this flow
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    setLoading(true);
    try {
      const { data, error } = await listMfaFactors();
      if (error) throw error;
      
      const activeFactor = data?.all?.find((f: any) => f.status === 'verified');
      if (activeFactor) {
        setFactor(activeFactor);
      }
    } catch (err) {
      console.error("Error listing MFA factors:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await enrollMfa();
      if (error) throw error;
      
      setFactor(data);
      setQrCode(data.totp.qr_code);
    } catch (err: any) {
      toast.error("Chyba pri inicializácii MFA: " + err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Zadajte 6-miestny kód");
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await verifyMfa(factor.id, verifyCode);
      if (error) throw error;
      
      toast.success("MFA bolo úspešne aktivované");
      setQrCode(null);
      setVerifyCode("");
      checkMfaStatus();
    } catch (err: any) {
      toast.error("Neplatný kód: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm("Naozaj chcete vypnúť 2FA? Vaša bezpečnosť sa zníži.")) return;
    
    setLoading(true);
    try {
      const { error } = await unenrollMfa(factor.id);
      if (error) throw error;
      
      toast.success("MFA bolo vypnuté");
      setFactor(null);
      setQrCode(null);
    } catch (err: any) {
      toast.error("Chyba pri vypínaní MFA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Záložný kód bol skopírovaný");
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (factor && factor.status === 'verified') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-bold text-white uppercase text-xs tracking-wider">MFA je aktívne</p>
              <p className="text-xs text-zinc-400">Váš účet je chránený druhým faktorom.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleUnenroll} className="text-xs border-zinc-800 hover:bg-zinc-800">
            Vypnúť
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!qrCode ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <ShieldAlert className="h-6 w-6 text-amber-500 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white uppercase text-xs tracking-wider">MFA nie je nastavené</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Dvojfaktorová autentifikácia (MFA) pridáva ďalšiu vrstvu bezpečnosti k vášmu účtu. Použite aplikáciu ako Google Authenticator alebo Authy na skenovanie QR kódu.</p>
              <Button 
                onClick={handleEnroll} 
                disabled={isEnrolling}
                className="mt-5 w-full sm:w-auto"
              >
                {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Nastaviť zabezpečenie
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch animate-fade-in">
          {/* QR Code Card */}
          <div className="bg-white dark:bg-[#0a0a0a] p-8 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-8 shadow-sm">
            <div className="text-center w-full border-b border-slate-100 dark:border-zinc-900 pb-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">1. Naskenujte kód</h4>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-bold">Použite Google Authenticator alebo Authy</p>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(255,102,0,0.05)] border border-slate-100 dark:border-zinc-800 max-w-[240px] w-full aspect-square flex items-center justify-center overflow-hidden">
               <div 
                 dangerouslySetInnerHTML={{ __html: qrCode }} 
                 className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block" 
               />
            </div>
            
            <div className="w-full pt-2">
               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3 text-center">Záložný kód (Manual Entry)</label>
               <div className="flex gap-2 bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-900">
                 <Input 
                   className="bg-transparent border-none text-zinc-500 font-mono text-xs h-9 cursor-default flex-1 text-center shadow-none focus-visible:ring-0" 
                   readOnly 
                   value={backupCode} 
                 />
                 <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-9 px-3 text-zinc-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                 </Button>
               </div>
            </div>
          </div>
          
          {/* Verification Form Card */}
          <div className="bg-white dark:bg-[#0a0a0a] p-8 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-10 shadow-sm">
            <div className="w-full border-b border-slate-100 dark:border-zinc-900 pb-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">2. Overte aktiváciu</h4>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-bold text-left">Zadajte 6-miestny kód z aplikácie</p>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vložte overovací kód</label>
              <Input 
                className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-900 text-slate-900 dark:text-white font-mono text-center tracking-[0.5em] text-2xl h-20 rounded-2xl focus:ring-primary focus:border-primary shadow-inner" 
                placeholder="000 000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <Button 
                onClick={handleVerify} 
                disabled={isVerifying || verifyCode.length !== 6}
                className="h-16 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary text-black hover:bg-primary/90 transition-all active:scale-95 mt-4 rounded-xl"
              >
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Aktivovať zabezpečenie
              </Button>
            </div>

            <div className="pt-8 flex items-start gap-4 text-zinc-500 border-t border-slate-100 dark:border-zinc-900/50">
              <div className="p-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] leading-relaxed font-medium">Uistite sa, že máte na svojom zariadení správne nastavený dátum a čas, inak sa generované kódy nebudú zhodovať so serverom.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
