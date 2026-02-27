"use client";

import { 
  Users, Send, TrendingUp, Filter, Phone, Mail, Handshake, Plus, Expand, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStats, useRecentLeads, useRecentActivities } from "@/hooks/useDashboardStats";

export function SalesDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads, isLoading: leadsLoading } = useRecentLeads(4);
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities(3);

  const isLoading = statsLoading || leadsLoading || activitiesLoading;

  const leadsTotal = stats?.leads?.total || 0;
  const leadsContacted = stats?.leads?.contacted || 0;
  const leadsOffer = stats?.leads?.offer || 0;
  const readiness = leadsTotal > 0 ? Math.round(((leadsContacted + leadsOffer) / leadsTotal) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* My Leads */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Moje Leady</p>
              <h3 className="text-3xl font-bold text-white mt-1">{leadsTotal}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-white font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
              {stats?.leads?.new || 0} nových
            </span>
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-gray-400 flex items-center">
              {leadsContacted} kontaktovaných
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500"></div>
        </div>

        {/* Sent Quotes */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Odoslané Ponuky</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(stats?.quotes?.totalValue || 0)}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className={cn(
              "font-medium flex items-center",
              (stats?.quotes?.totalChange || 0) >= 0 ? "text-blue-400" : "text-red-400"
            )}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {stats?.quotes?.totalChange || 0}%
            </span>
            <span className="text-gray-500 ml-2">oproti minulému týždňu</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors duration-500"></div>
        </div>

        {/* Monthly Target */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-green-600/30 transition-all duration-300">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Pripravenosť dopytov</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {readiness}%
              </h3>
              <p className="text-xs text-gray-500 mt-1">Leady v procese spracovania</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${readiness}, 100`} strokeWidth="3"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm z-10 relative">
            <span className="text-green-500 font-medium">{leadsOffer} dopytov s ponukou</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-600/5 rounded-full group-hover:bg-green-600/10 transition-colors duration-500"></div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Active Deals Table */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-0 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-border-dark flex justify-between items-center bg-[#252525] rounded-t-xl">
            <h3 className="text-lg font-bold text-white">Najnovšie dopyty</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-border-dark bg-[#1F1F1F]">
                  <th className="px-6 py-4">Klient / Lead</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Dátum pridania</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {recentLeads?.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/30">
                          {lead.contact_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{lead.contact_name}</p>
                          <p className="text-xs text-gray-500">{lead.company_name || 'Súkromná osoba'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                        lead.status === 'new' ? "bg-blue-900/30 text-blue-400 border-blue-900/50" :
                        lead.status === 'contacted' ? "bg-purple-900/30 text-purple-400 border-purple-900/50" :
                        "bg-green-900/30 text-green-400 border-green-900/50"
                      )}>
                        {lead.status === 'new' ? 'Nový' : lead.status === 'contacted' ? 'Kontaktovaný' : lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 text-right">
                      {new Date(lead.created_at).toLocaleDateString('sk-SK')}
                    </td>
                  </tr>
                ))}
                {(!recentLeads || recentLeads.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-zinc-500 italic">Žiadne nové dopyty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border-dark bg-[#1F1F1F] rounded-b-xl flex justify-center">
            <button className="text-xs text-gray-400 hover:text-white transition-colors font-medium flex items-center">
              Zobraziť všetky prípady <Expand className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Activities */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Posledné aktivity</h3>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded border border-primary/20">{recentActivities?.length || 0} záznamov</span>
            </div>
            
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer group">
                  <div className={cn(
                    "flex-shrink-0 mt-0.5 rounded-full p-1.5 border",
                    activity.activity_type === 'call' ? "bg-green-900/30 border-green-900/50" :
                    activity.activity_type === 'email' ? "bg-blue-900/30 border-blue-900/50" :
                    "bg-amber-900/30 border-amber-900/50"
                  )}>
                    {activity.activity_type === 'call' ? <Phone className="w-4 h-4 text-green-400" /> :
                     activity.activity_type === 'email' ? <Mail className="w-4 h-4 text-blue-400" /> :
                     <Handshake className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{activity.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              ))}
              {(!recentActivities || recentActivities.length === 0) && (
                <div className="text-center py-6 text-zinc-500 italic text-xs">Žiadne aktivity.</div>
              )}
            </div>

            <button className="w-full mt-5 py-2 text-xs font-medium text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center">
              <Plus className="w-4 h-4 mr-1" />
              Pridať aktivitu
            </button>
          </div>

          {/* Business Summary */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4">Miera úspešnosti</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Vyhrané leady</span>
                  <span>{stats?.leads?.won || 0} / {stats?.leads?.total || 0}</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-surface-darker">
                  <div className="bg-primary hover:bg-primary-hover transition-colors h-full" style={{width: `${stats?.conversionRate || 0}%`}}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface-darker p-3 rounded-lg border border-border-dark text-center">
                  <div className="text-xs text-gray-500 uppercase">Ponuky</div>
                   <div className="text-xl font-bold text-white mt-1">{stats?.quotes?.total || 0}</div>
                </div>
                <div className="bg-surface-darker p-3 rounded-lg border border-border-dark text-center">
                  <div className="text-xs text-gray-500 uppercase">Leady</div>
                   <div className="text-xl font-bold text-white mt-1">{stats?.leads?.total || 0}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
