import { useState, useMemo, useEffect } from "react";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { ClientDetailDialog } from "@/components/clients/ClientDetailDialog";
import { QuickActivityDialog } from "@/components/shared/QuickActivityDialog";
import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useDeleteClient } from "@/hooks/useClients";
import { useRegions } from "@/hooks/useRegions";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CRMNavigation } from "@/components/shared/CRMNavigation";
import {
  Plus,
  Search,
  Users,
  Grid3X3,
  List,
  Phone,
  Mail,
  MapPin,
  Building2,
  MoreHorizontal,
  StickyNote,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types/database";

const statusLabels: Record<ClientStatus, string> = {
  active: "Aktívny",
  inactive: "Neaktívny",
  prospect: "Potenciálny",
  completed: "Vybavený",
};

const statusVariants: Record<
  ClientStatus,
  "success" | "secondary" | "info" | "completed"
> = {
  active: "success",
  inactive: "secondary",
  prospect: "info",
  completed: "completed",
};

export function ClientsClientView() {
  const { user } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"list" | "detail">("list");
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const supabaseClient = createClient();
    const channel = supabaseClient
      .channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        console.log('Realtime update for clients:', payload);
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: clients = [], isLoading, isError } = useClients({
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : (statusFilter as ClientStatus),
  });
  const { data: regions = [] } = useRegions();
  const deleteClient = useDeleteClient();

  const currentClient = useMemo(() => {
    if (!selectedClient) return null;
    return clients.find(c => c.id === selectedClient.id) || selectedClient;
  }, [clients, selectedClient]);

  const isAdmin = user?.role === "admin" || user?.role === "správca";

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return "Neurčený";
    const region = regions.find((r) => r.id === regionId);
    return region?.name || "Neurčený";
  };

  const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat("sk-SK", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  };

  const handleShowDetail = (client: Client) => {
    setSelectedClient(client);
    setActiveTab("detail");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#030303]">
      <CRMNavigation />

      <main className="p-6 sm:p-10 max-w-[1920px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              Klienti
            </h2>
            <p className="text-sm text-zinc-500 font-medium">Správa aktívnych a potenciálnych klientov</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-3 top-3 text-zinc-500 h-4 w-4 transition-colors group-focus-within:text-primary" />
              <input 
                className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-xl" 
                placeholder="Hľadať klientov..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setCreateClientOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-[0_0_20px_rgba(255,102,0,0.15)] uppercase tracking-widest text-[10px] rounded-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Pridať klienta</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-zinc-900/30 animate-pulse rounded-2xl border border-zinc-800/50" />
              ))}
            </div>
          ) : activeTab === "detail" && currentClient ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-zinc-800 pb-8">
                  <div className="flex items-center gap-6">
                     <Avatar className="h-20 w-20 rounded-2xl border border-zinc-800">
                           {currentClient.photo_url ? (
                              <AvatarImage src={currentClient.photo_url} className="object-cover" />
                           ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold rounded-2xl">
                               {currentClient.contact_name?.[0] || "?"}
                            </AvatarFallback>
                         </Avatar>
                     <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{currentClient.contact_name}</h3>
                        <div className="flex items-center gap-4">
                           <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{currentClient.company_name || "Súkromná osoba"}</span>
                           <span className="h-1 w-1 bg-zinc-700 rounded-full"></span>
                           <span className="text-xs text-primary font-mono">{currentClient.status}</span>
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
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                     <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Kontaktné informácie</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-950/50 p-6 rounded-xl border border-zinc-900">
                           <div className="space-y-1">
                              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Email</p>
                              <p className="text-sm text-zinc-300">{currentClient.email || "Neuvedený"}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Telefón</p>
                              <p className="text-sm text-zinc-300">{currentClient.phone || "Neuvedený"}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Adresa</p>
                              <p className="text-sm text-zinc-300">{currentClient.address || "Neuvedená"}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Región</p>
                              <p className="text-sm text-zinc-300">{getRegionName(currentClient.region_id)}</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-8">
                     <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 shadow-inner text-center">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Celková hodnota</h4>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(currentClient.total_value)}</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <div className="col-span-full p-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                       <Users className="h-12 w-12 text-zinc-800" />
                       <p className="text-zinc-600 font-medium">Nenašli sa žiadni klienti</p>
                   </div>
                </div>
              ) : (
                clients.map((client) => (
                  <div 
                    key={client.id}
                    onClick={() => handleShowDetail(client)}
                    className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer shadow-soft hover:shadow-2xl hover:-translate-y-1"
                  >
                      <div className="flex items-start justify-between mb-6">
                         <Avatar className="h-12 w-12 rounded-xl border border-zinc-800 group-hover:border-primary/30 transition-all">
                            {client.photo_url ? (
                               <AvatarImage src={client.photo_url} className="object-cover" />
                            ) : null}
                             <AvatarFallback className="bg-zinc-900 text-primary font-bold rounded-xl">
                                {client.contact_name?.[0] || "?"}
                             </AvatarFallback>
                          </Avatar>
                         <div className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                           client.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        )}>
                           {statusLabels[client.status as ClientStatus]}
                        </div>
                     </div>
                     
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{client.contact_name}</h3>
                     <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-6">{client.company_name || "Súkromná osoba"}</p>
                     
                     <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                           <Mail className="h-4 w-4" />
                           <span className="truncate">{client.email || "Neuvedený"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                           <Phone className="h-4 w-4" />
                           <span>{client.phone || "Neuvedený"}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{getRegionName(client.region_id)}</span>
                        <span className="text-sm font-bold text-primary">{formatCurrency(client.total_value)}</span>
                     </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <CreateClientDialog open={createClientOpen} onOpenChange={setCreateClientOpen} />
      <EditClientDialog client={currentClient} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
