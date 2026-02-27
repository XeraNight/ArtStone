"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MfaSetup } from "@/components/auth/MfaSetup";
import { UserManagement } from "@/components/settings/UserManagement";
import { User, Shield, Settings as SettingsIcon, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function SettingsClientView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: profileForm.phone
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success("Profil bol úspešne aktualizovaný");
    } catch (error: any) {
      toast.error("Chyba pri ukladaní profilu: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#030303]">
      {/* Tabs Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <nav aria-label="Tabs" className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors flex items-center gap-2",
              activeTab === "profile" 
                ? "border-primary text-primary" 
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-300"
            )}
          >
            <User className="h-4 w-4" />
            Profil
          </button>
          {(user?.role === 'admin' || user?.role === 'správca') && (
            <button
              onClick={() => setActiveTab("users")}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors flex items-center gap-2",
                activeTab === "users" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-300"
              )}
            >
              <SettingsIcon className="h-4 w-4" />
              Používatelia
            </button>
          )}
        </nav>
      </div>

      <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {activeTab === "profile" && (
          <div className="animate-fade-in space-y-10 pb-20">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* Left Column: Form */}
              <div className="flex-[2] space-y-8">
                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6 shadow-sm rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-4 uppercase tracking-wide flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Osobné údaje
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName" className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Meno</Label>
                      <Input 
                        id="firstName" 
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 py-2.5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName" className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Priezvisko</Label>
                      <Input 
                        id="lastName" 
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 py-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Emailová adresa</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileForm.email}
                      readOnly
                      className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 text-slate-500 dark:text-zinc-600 px-4 py-2.5 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone" className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Telefónne číslo</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="+421 900 000 000"
                      className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 py-2.5"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="font-bold uppercase tracking-widest px-8 py-6 h-auto transition-transform active:scale-95"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Uložiť profil
                    </Button>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6 shadow-sm rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-4 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Bezpečnosť
                  </h3>
                  
                  <MfaSetup />
                </div>
              </div>

              {/* Right Column: Sidebar Settings */}
              <div className="flex-1 space-y-6">
                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6 shadow-sm rounded-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-4 uppercase tracking-wide flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                    Predvoľby
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Jazyk rozhrania</label>
                    <select className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none cursor-pointer rounded-md">
                      <option value="sk">Slovenský</option>
                      <option value="cz">Český</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 p-6 sm:p-8 rounded-xl">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Nebezpečná zóna
                  </h3>
                  <p className="text-xs text-red-500/80 mb-6">Tieto akcie sú nevratné. Prosím, postupujte opatrne.</p>
                  <Button variant="destructive" className="w-full font-bold uppercase tracking-widest py-5">
                    Vymazať účet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (user?.role === 'admin' || user?.role === 'správca') && (
          <div className="animate-fade-in pb-10">
            <UserManagement />
          </div>
        )}
      </div>
    </div>
  );
}
