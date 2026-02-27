"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";
import { AssignLeadDialog } from "@/components/leads/AssignLeadDialog";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { ConvertToClientDialog } from "@/components/leads/ConvertToClientDialog";
import { QuickActivityDialog } from "@/components/shared/QuickActivityDialog";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { ViewToggle } from "@/components/leads/ViewToggle";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useLeads, useUpdateLeadStatus, useDeleteLead } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { useRegions } from "@/hooks/useRegions";
import { useSalespeople } from "@/hooks/useSalespeople";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus, LeadSource } from "@/types/database";

const statusLabels: Record<LeadStatus, string> = {
  new: "Nový",
  contacted: "Kontaktovaný",
  offer: "Ponuka",
  won: "Vyhraný",
  lost: "Stratený",
  waiting: "Čaká sa",
};

const sourceLabels: Record<LeadSource, string> = {
  facebook_lead_ads: "Facebook Lead Ads",
  facebook_ads: "Facebook Ads",
  google_ads: "Google Ads",
  website_form: "Web formulár",
  manual: "Manuálne",
};

export function LeadsClientView() {
  const { user } = useAuth();
  const router = useRouter();
  // View state
  const [viewMode, setViewMode] = useState<"list" | "kanban">(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("artstone-leads-view")
        : null;
    return saved === "kanban" ? "kanban" : "list"; // Default to list if not kanban
  });
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [creatorFilter, setCreatorFilter] = useState<string>("all");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityType, setActivityType] = useState<"call" | "email" | "note">(
    "note"
  );

  useEffect(() => {
    localStorage.setItem("artstone-leads-view", viewMode === "kanban" ? "kanban" : "table"); // Store as "table" for list view
  }, [viewMode]);

  // Queries
  const { data: leads, isLoading, isError } = useLeads();
  const { data: regions = [] } = useRegions();
  const { data: salespeople = [] } = useSalespeople();
  const updateStatus = useUpdateLeadStatus();
  const deleteLead = useDeleteLead();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // Filter leads based on search and status
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    
    return leads.filter(lead => {
      // Status filter
      if (filterStatus !== "all" && lead.status !== filterStatus) return false;
      if (sourceFilter !== "all" && lead.source_type !== sourceFilter) return false;
      if (creatorFilter !== "all" && lead.created_by !== creatorFilter) return false;
      
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        return (
          lead.contact_name.toLowerCase().includes(query) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(query)) ||
          (lead.email && lead.email.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [leads, filterStatus, sourceFilter, creatorFilter, debouncedSearch]);

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return "Neurčený";
    const region = regions.find((r) => r.id === regionId);
    return region?.name || "Neurčený";
  };

  const getAssignedUserInitials = (userId: string | null) => {
    if (!userId) return "?";
    const person = salespeople.find((p) => p.id === userId);
    if (!person?.full_name) return "?";
    return person.full_name.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateStatus.mutateAsync({ leadId, status: newStatus });
      toast.success("Status leadu bol aktualizovaný");
    } catch {
      toast.error("Nepodarilo sa aktualizovať status");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Naozaj chcete vymazať tento lead?")) return;
    try {
      await deleteLead.mutateAsync(leadId);
      toast.success("Lead bol vymazaný");
    } catch {
      toast.error("Nepodarilo sa vymazať lead");
    }
  };

  const handleShowDetail = (lead: Lead) => {
    setSelectedLead(lead);
    // Zatial presmerujeme priamo na /leads/[id] pre novy vzhlad detailu
    router.push(`/app/leads/${lead.id}`);
  };

  const handleExportLeads = (leadsToExport: Lead[]) => {
    const headers = ["Meno", "Firma", "Email", "Telefón", "Status"];
    const rows = leadsToExport.map((lead) => [
      lead.contact_name,
      lead.company_name || "",
      lead.email || "",
      lead.phone || "",
      statusLabels[lead.status as LeadStatus],
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.click();
  };

  if (isError) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 p-6 m-6">
        <h3 className="text-red-500 font-bold mb-2">Chyba</h3>
        <p className="text-zinc-400">Nepodarilo sa načítať dáta zo serveru.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-solid border-slate-200 dark:border-zinc-800 bg-background-light dark:bg-[#0a0a0a] px-6 lg:px-8 z-10 text-left">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Leadi a klienti
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">
              CRM Modul
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">
              notifications
            </span>
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-[#0a0a0a]"></span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800"></div>
          <button
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signOut().then(() => router.push("/login"));
            }}
            className="text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors text-sm font-medium"
          >
            Odhlásiť
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-12 text-left">
        <div className="max-w-[1920px] mx-auto w-full">
          {/* Title & Stats */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Správa dopytov a klientov
              </h2>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-white">
                    {leads?.filter((l) => l.status === "new").length || 0} Nových
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-white">
                    {leads?.filter((l) => l.status === "contacted").length || 0} V komunikácii
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-white">
                    {leads?.filter((l) => l.status === "offer").length || 0} Ponuky
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 flex items-center p-1 rounded-sm mr-2 w-auto">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-2 transition-colors text-xs font-bold uppercase tracking-wider",
                    viewMode === "list"
                      ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                  )}
                >
                  <span className="material-symbols-outlined text-lg">
                    list
                  </span>
                  Zoznam
                </button>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-zinc-800 mx-1"></div>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-2 transition-colors text-xs font-bold uppercase tracking-wider",
                    viewMode === "kanban"
                      ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                  )}
                >
                  <span className="material-symbols-outlined text-lg">
                    view_kanban
                  </span>
                  Nástavba
                </button>
              </div>

              <button
                onClick={() => setCreateLeadOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(255,102,0,0.2)] uppercase tracking-wider text-xs"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Nový kontakt</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-4 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-zinc-500 text-lg">search</span>
                <input 
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                  placeholder="Hľadať meno, firmu, email..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-2 hidden lg:block"></div>

              {/* Status Filter */}
              <div className="relative hidden lg:block">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-transparent border-none text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 py-2 pr-8 focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="all">Všetky statusy</option>
                  <option value="new">Nové</option>
                  <option value="contacted">Kontaktované</option>
                  <option value="offer">V riešení</option>
                  <option value="won">Úspešné</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-2 text-zinc-500 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
                {isAdmin && (
                  <button 
                    onClick={() => handleExportLeads(filteredLeads)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Export</span>
                  </button>
                )}
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 border border-zinc-800 animate-pulse">
                Načítavam leady...
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanBoard />
          ) : (
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                      <th className="px-6 py-4">Kontakt & Zákazník</th>
                      <th className="px-6 py-4">Zdroj</th>
                      <th className="px-6 py-4">Fáza obchodu</th>
                      <th className="px-6 py-4">Obchodník</th>
                      <th className="px-6 py-4">Posledná interakcia</th>
                      <th className="px-6 py-4 text-right">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">Žiadne leady na zobrazenie</td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col">
                                    <a onClick={() => handleShowDetail(lead)} className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer mb-1 line-clamp-1">
                                        {lead.contact_name}
                                    </a>
                                    <div className="flex items-center gap-3">
                                        {lead.phone && (
                                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider group/contact">
                                                <span className="material-symbols-outlined text-[14px] text-zinc-400 group-hover/contact:text-primary transition-colors">call</span>
                                                {lead.phone}
                                            </span>
                                        )}
                                        {lead.email && (
                                            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider group/contact">
                                                <span className="material-symbols-outlined text-[14px] text-zinc-400 group-hover/contact:text-primary transition-colors">mail</span>
                                                {lead.email}
                                            </span>
                                        )}
                                    </div>
                                    {lead.company_name && (
                                        <div className="mt-2 text-[10px] text-zinc-500 uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 inline-block w-fit bg-slate-50 dark:bg-zinc-900">
                                            {lead.company_name}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700">
                                    <span className="material-symbols-outlined text-sm">{lead.source_type === 'facebook_ads' ? 'web' : 'public'}</span>
                                    {sourceLabels[lead.source_type as LeadSource] || 'Neznámy'}
                                </span>
                            </td>
                            <td className="px-6 py-4 align-top">
                                {lead.status === 'new' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Nový dopyt
                                    </span>
                                )}
                                {lead.status === 'contacted' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-900/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        Kontaktovaný
                                    </span>
                                )}
                                {lead.status === 'offer' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-200 dark:border-orange-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                        Cenová ponuka
                                    </span>
                                )}
                                {lead.status === 'won' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Úspešný
                                    </span>
                                )}
                                {['lost', 'waiting'].includes(lead.status) && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                                        {statusLabels[lead.status as LeadStatus]}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center text-[10px] font-bold border border-zinc-700">
                                        {getAssignedUserInitials(lead.assigned_user_id)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(lead.created_at).toLocaleDateString('sk-SK')}</span>
                                    <span className="text-sm text-slate-900 dark:text-white mt-0.5">Vytvorenie dopytu</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right align-top">
                                <div className="flex items-start justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleShowDetail(lead)} className="p-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-400 hover:text-primary hover:border-primary transition-colors" title="Zobraziť detaily">
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <CreateLeadDialog open={createLeadOpen} onOpenChange={setCreateLeadOpen} />
      <EditLeadDialog lead={selectedLead} open={editOpen} onOpenChange={setEditOpen} />
      <AssignLeadDialog lead={selectedLead} open={assignOpen} onOpenChange={setAssignOpen} />
      <ConvertToClientDialog lead={selectedLead} open={convertOpen} onOpenChange={setConvertOpen} />
    </div>
  );
}
