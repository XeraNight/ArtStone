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
import { AssignSalespersonDialog } from "@/components/shared/AssignSalespersonDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRegions } from "@/hooks/useRegions";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useLeads, useUpdateLeadStatus, useDeleteLead, useAssignSalespersonToLead } from "@/hooks/useLeads";
import { useClients, useAssignSalespersonToClient } from "@/hooks/useClients";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/lib/supabase/client";
import { CRMNavigation } from "@/components/shared/CRMNavigation";
import { Plus, Search, Eye, Inbox, User, Link as LinkIcon, UserCheck, ArrowLeft } from "lucide-react";
import { AssignClientToLeadDialog } from "@/components/leads/AssignClientToLeadDialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"list" | "kanban" | "detail">(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("artstone-leads-view") : null;
    return saved === "kanban" ? "kanban" : "list";
  });
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [creatorFilter, setCreatorFilter] = useState<string>("all");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [assignClientOpen, setAssignClientOpen] = useState(false);
  const [assignSalespersonOpen, setAssignSalespersonOpen] = useState(false);
  const [assignSalespersonType, setAssignSalespersonType] = useState<"lead" | "client">("lead");

  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem("artstone-leads-view", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const supabaseClient = createClient();
    const channel = supabaseClient
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        console.log('Realtime update for leads:', payload);
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient]);


  // Update URL when selectedLead changes
  const updateUrl = (id: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set('selected', id);
      // Optional: If we want to move towards the new detail page eventually
      // router.push(`/app/leads/detail?id=${id}`);
    } else {
      params.delete('selected');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });
  };

  // Queries
  const { data: leads, isLoading, isError } = useLeads();
  const { data: regions = [] } = useRegions();
  const { data: salespeople = [] } = useSalespeople();
  const { data: clients = [] } = useClients();
  const updateStatus = useUpdateLeadStatus();
  const assignSalespersonToLead = useAssignSalespersonToLead();
  const assignSalespersonToClient = useAssignSalespersonToClient();

  // Sync selectedLead from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('selected');
    if (selectedId && leads) {
      const lead = leads.find(l => l.id === selectedId);
      if (lead) {
        setSelectedLead(lead);
        if (activeTab !== "detail") setActiveTab("detail");
      }
    } else if (!selectedId && activeTab === "detail") {
      setActiveTab("list");
      setSelectedLead(null);
    }
  }, [leads]);

  const isAdmin = user?.role === "admin" || user?.role === "správca";

  // Filter leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    
    return leads.filter((lead: Lead) => {
      if (filterStatus !== "all" && lead.status !== filterStatus) return false;
      if (sourceFilter !== "all" && lead.source_type !== sourceFilter) return false;
      if (creatorFilter !== "all" && lead.created_by !== creatorFilter) return false;
      
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
  
  const currentLead = useMemo(() => {
    if (!selectedLead) return null;
    return leads?.find(l => l.id === selectedLead.id) || selectedLead;
  }, [leads, selectedLead]);

  const getAssignedUserInitials = (userId: string | null) => {
    if (!userId) return "?";
    const person = salespeople.find((p) => p.id === userId);
    if (!person?.full_name) return "?";
    return person.full_name.substring(0, 2).toUpperCase();
  };

  const handleShowDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab("detail");
    updateUrl(lead.id);
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedLead(null);
    updateUrl(null);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateStatus.mutateAsync({ leadId, status: newStatus });
      toast.success("Status leadu bol aktualizovaný");
    } catch {
      toast.error("Nepodarilo sa aktualizovať status");
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.contact_name || client?.company_name || "Neznámy klient";
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#030303]">
      <CRMNavigation />

      <main className="p-6 sm:p-10 max-w-[1920px] mx-auto w-full">
        {/* Header Section with Search & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              Leady
            </h2>
            <p className="text-sm text-zinc-500 font-medium">Správa a sledovanie potenciálnych obchodov</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-3 top-3 text-zinc-500 h-4 w-4 transition-colors group-focus-within:text-primary" />
              <input 
                className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-xl" 
                placeholder="Hľadať meno, firmu, email..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setCreateLeadOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-[0_0_20px_rgba(255,102,0,0.15)] uppercase tracking-widest text-[10px] rounded-xl whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Nový lead</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
           <div className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status:</span>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
              >
                <option value="all">Všetky</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
           </div>
           
           <div className="bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Zdroj:</span>
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
              >
                <option value="all">Všetky</option>
                {Object.entries(sourceLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
           </div>
        </div>

        {/* Content Section */}
        <div className="animate-fade-in">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-900/30 animate-pulse rounded-xl border border-zinc-800/50" />
              ))}
            </div>
          ) : activeTab === "kanban" ? (
            <KanbanBoard />
          ) : activeTab === "detail" ? (
            !selectedLead ? (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 mb-4">
                  <Eye className="h-8 w-8" />
                </div>
                <h3 className="text-white font-bold text-lg">Vyberte lead</h3>
                <p className="text-zinc-600 font-medium">Kliknite na lead v zozname pre zobrazenie detailov.</p>
              </div>
            ) : !currentLead ? (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-white font-bold text-lg">Lead nebol nájdený</h3>
                <p className="text-zinc-600 font-medium">Dáta tohto leadu sa nepodarilo načítať.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col gap-6">
                  <button 
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors group w-fit"
                  >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Späť na zoznam
                  </button>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-zinc-800 pb-8 mt-6">
                   <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 rounded-2xl border border-primary/20 bg-primary/10">
                         {currentLead.photo_url ? (
                            <AvatarImage src={currentLead.photo_url} alt={currentLead.contact_name} className="object-cover" />
                         ) : (
                            <AvatarFallback className="bg-transparent text-primary text-3xl font-bold">
                               {currentLead.contact_name?.[0] || "?"}
                            </AvatarFallback>
                         )}
                      </Avatar>
                      <div>
                         <h3 className="text-2xl font-bold text-white mb-1">{currentLead.contact_name}</h3>
                         <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{currentLead.company_name || "Súkromná osoba"}</span>
                            <span className="h-1 w-1 bg-zinc-700 rounded-full"></span>
                            <span className="text-xs text-primary font-mono">{currentLead.source_type}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setEditOpen(true)}
                        className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        Upraviť
                      </button>
                      <button 
                        onClick={() => setConvertOpen(true)}
                        className="px-6 py-2.5 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        Konvertovať na klienta
                      </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 space-y-10">
                      <div>
                         <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Kontaktné informácie</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-950/50 p-6 rounded-xl border border-zinc-900">
                            <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Email</p>
                               <p className="text-sm text-zinc-300">{currentLead.email || "Neuvedený"}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Telefón</p>
                               <p className="text-sm text-zinc-300">{currentLead.phone || "Neuvedený"}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Adresa</p>
                               <p className="text-sm text-zinc-300">
                                  {currentLead.address ? (
                                     <>
                                        {currentLead.address}
                                        {currentLead.city && `, ${currentLead.city}`}
                                        {currentLead.postal_code && ` ${currentLead.postal_code}`}
                                     </>
                                  ) : "Neuvedená"}
                               </p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Región</p>
                               <p className="text-sm text-zinc-300">{regions.find(r => r.id === currentLead.region_id)?.name || "Neurčený"}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Obchodník</p>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setAssignSalespersonOpen(true);
                                 }}
                                 className="text-sm text-primary hover:underline flex items-center gap-2 text-left"
                               >
                                  {currentLead.salesperson_id ? (
                                    <>
                                      <User className="h-4 w-4" />
                                      {salespeople.find(p => p.id === currentLead.salesperson_id)?.full_name || "Neznámy"}
                                    </>
                                  ) : (
                                    <>
                                      <LinkIcon className="h-4 w-4" />
                                      Nepriradené
                                    </>
                                  )}
                               </button>
                            </div>
                             <div className="space-y-1">
                               <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Aktuálny Status</p>
                               <div className="pt-1">
                                  <Badge variant={currentLead.status} className="uppercase tracking-widest text-[9px] font-black px-3 py-1">
                                     {statusLabels[currentLead.status]}
                                  </Badge>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div>
                         <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Poznámky</h4>
                         <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-900 min-h-[150px]">
                            <p className="text-sm text-zinc-400 leading-relaxed italic">
                               {currentLead.notes || "K tomuto leadu nie sú žiadne poznámky."}
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 shadow-inner">
                         <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Status obchodu</h4>
                         <div className="space-y-4">
                            {Object.entries(statusLabels).map(([key, label]) => (
                               <button 
                                 key={key}
                                 onClick={() => handleStatusChange(currentLead.id, key as LeadStatus)}
                                 className={cn(
                                   "w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                                   currentLead.status === key 
                                     ? "bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(255,102,0,0.1)]" 
                                     : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                                 )}
                               >
                                  <div className="flex justify-between items-center">
                                     <span>{label}</span>
                                     {currentLead.status === key && <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></span>}
                                  </div>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )) : (
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      <th className="px-8 py-5">Kontakt</th>
                      <th className="px-8 py-5">Zdroj</th>
                      <th className="px-8 py-5">Fáza</th>
                      <th className="px-8 py-5">Obchodník</th>
                      <th className="px-8 py-5 text-right">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Inbox className="h-12 w-12 text-zinc-800" />
                                <p className="text-zinc-600 font-medium">Nenašli sa žiadne leady</p>
                            </div>
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead: Lead) => (
                        <tr 
                          key={lead.id} 
                          className="group hover:bg-slate-50 dark:hover:bg-zinc-950/50 transition-all cursor-pointer"
                          onClick={() => handleShowDetail(lead)}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary font-bold group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                  {lead.contact_name[0]}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{lead.contact_name}</div>
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{lead.company_name || "Súkromná osoba"}</div>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900/50 px-2.5 py-1 border border-zinc-800 rounded">
                              {sourceLabels[lead.source_type as LeadSource] || lead.source_type}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                      "h-2 w-2 rounded-full",
                                      lead.status === 'new' && "bg-blue-500",
                                      lead.status === 'contacted' && "bg-purple-500",
                                      lead.status === 'offer' && "bg-orange-500",
                                      lead.status === 'won' && "bg-emerald-500",
                                      lead.status === 'lost' && "bg-red-500",
                                      lead.status === 'waiting' && "bg-zinc-500"
                                   )}></div>
                                   <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{statusLabels[lead.status as LeadStatus]}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLead(lead);
                                    setAssignClientOpen(true);
                                  }}
                                  className="text-[10px] font-medium text-zinc-500 hover:text-primary transition-colors flex items-center gap-1.5"
                                >
                                   {lead.client_id ? (
                                     <>
                                       <UserCheck className="h-3 w-3" />
                                       <span className="truncate max-w-[120px]">{getClientName(lead.client_id)}</span>
                                     </>
                                   ) : (
                                     <>
                                       <LinkIcon className="h-3 w-3" />
                                       Nepriradené
                                     </>
                                   )}
                                </button>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                   {getAssignedUserInitials(lead.assigned_user_id)}
                                </div>
                                <span className="text-xs text-zinc-500 font-medium">
                                   {salespeople.find(p => p.id === lead.assigned_user_id)?.full_name || "Nepriradený"}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-zinc-900 hover:bg-primary/20 border border-zinc-800 hover:border-primary/30 text-zinc-500 hover:text-primary rounded-lg transition-all">
                                   <Eye className="h-4 w-4" />
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

      <CreateLeadDialog open={createLeadOpen} onOpenChange={setCreateLeadOpen} />
      <EditLeadDialog lead={selectedLead} open={editOpen} onOpenChange={setEditOpen} />
      <ConvertToClientDialog lead={selectedLead} open={convertOpen} onOpenChange={setConvertOpen} />
      <AssignClientToLeadDialog lead={selectedLead} open={assignClientOpen} onOpenChange={setAssignClientOpen} />
      <AssignSalespersonDialog 
        open={assignSalespersonOpen} 
        onOpenChange={setAssignSalespersonOpen}
        currentSalespersonId={currentLead?.salesperson_id}
        onAssign={(salespersonId) => {
          if (currentLead) {
            assignSalespersonToLead.mutate({ leadId: currentLead.id, salespersonId });
          }
        }}
        title={`Priradiť obchodníka k leadu ${currentLead?.contact_name || ''}`}
      />
    </div>
  );
}
