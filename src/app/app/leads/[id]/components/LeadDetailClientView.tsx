"use client";

import { useLead as useLeadQuery, useUpdateLeadStatus as useUpdateLeadStatusMutation } from "@/hooks/useLeads";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building, Globe, CheckCircle, 
  MessageSquare, Calendar, DownloadCloud, MoreVertical, Plus, Edit2, 
  Trash2, PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LeadDetailClientView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { data: lead, isLoading } = useLeadQuery(leadId);

  if (isLoading) return <PageSkeleton />;
  if (!lead) return <div className="text-center p-10 text-gray-500">Lead nebol nájdený.</div>;

  const statusColors: Record<string, string> = {
    'new': 'bg-blue-900/30 text-blue-400 border-blue-900/50',
    'contacted': 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50',
    'qualified': 'bg-purple-900/30 text-purple-400 border-purple-900/50',
    'proposal': 'bg-indigo-900/30 text-indigo-400 border-indigo-900/50',
    'won': 'bg-green-900/30 text-green-400 border-green-900/50',
    'lost': 'bg-red-900/30 text-red-400 border-red-900/50',
  };

  const statusLabels: Record<string, string> = {
    'new': 'Nový Dopyt',
    'contacted': 'Kontaktovaný',
    'qualified': 'Kvalifikovaný',
    'proposal': 'Ponuka Odoslaná',
    'won': 'Získaný',
    'lost': 'Stratený',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111] p-6 rounded-xl border border-border-dark shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-border-dark"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">{lead.contact_name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[lead.status] || statusColors['new']}`}>
                {statusLabels[lead.status] || lead.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400 flex items-center">
              {lead.company_name || 'Súkromná osoba'} 
              <span className="mx-2">•</span> 
              Vytvorené: {format(new Date(lead.created_at), 'd. MMMM yyyy', { locale: sk })}
            </p>
          </div>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-border-dark text-gray-300 hover:text-white bg-[#1A1A1A]">
            <Edit2 className="w-4 h-4 mr-2" /> Upraviť
          </Button>
          <Button className="flex-1 md:flex-none shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover text-white">
            Konvertovať na Klienta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar - Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
            <h3 className="text-lg font-bold text-white flex items-center mb-6">
              <User className="w-5 h-5 mr-2 text-primary" />
              Informácie o leadovi
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                  <p className="text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer">{lead.email || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Telefón</p>
                  <p className="text-sm font-medium text-white">{lead.phone || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Adresa lokality</p>
                  <p className="text-sm text-gray-300">
                    {lead.address || '—'}
                    {lead.postal_code && <br />}
                    {lead.postal_code && `${lead.postal_code}`}
                    {lead.region?.name && <><br />{lead.region.name}</>}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border-dark mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 uppercase font-medium">Zdroj leadu</span>
                  <span className="text-sm text-gray-300">{lead.source_type}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 uppercase font-medium">Zodpovedný</span>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mr-1.5 ring-1 ring-primary/30">
                      {(lead.assigned_user?.full_name || 'N').charAt(0)}
                    </div>
                    <span className="text-sm text-white">{lead.assigned_user?.full_name || 'Nepriradené'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase font-medium">Hodnota</span>
                  <span className="text-sm font-bold text-white">Nenastavená</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Rýchle akcie</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#252525] border border-border-dark hover:bg-white/5 hover:border-gray-500 transition-all group">
                <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-white mb-2" />
                <span className="text-xs font-medium text-gray-300">Poznámka</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#252525] border border-border-dark hover:bg-white/5 hover:border-primary transition-all group">
                <PhoneCall className="w-5 h-5 text-gray-400 group-hover:text-primary mb-2" />
                <span className="text-xs font-medium text-gray-300">Hovor</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#252525] border border-border-dark hover:bg-white/5 hover:border-blue-500 transition-all group">
                <DownloadCloud className="w-5 h-5 text-gray-400 group-hover:text-blue-400 mb-2" />
                <span className="text-xs font-medium text-gray-300">Ponuka</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#252525] border border-border-dark hover:bg-white/5 hover:border-green-500 transition-all group">
                <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-green-400 mb-2" />
                <span className="text-xs font-medium text-gray-300">Status</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Tabs / Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-border-dark bg-[#1A1A1A] overflow-x-auto">
              <button className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">
                Prehľad a Poznámky
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                Ponuky a Ceny (0)
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                Súbory (0)
              </button>
            </div>
            
            {/* Overview Content */}
            <div className="p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                Požiadavky klienta
              </h4>
              <div className="bg-[#1F1F1F] p-4 rounded-lg border border-border-dark mb-6">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {lead.notes || 'Žiadne poznámky.'}
                </p>
              </div>

              {/* Add Note Input Area */}
              <div className="mt-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/30">
                    A
                  </div>
                  <div className="flex-1">
                    <textarea 
                      rows={3} 
                      className="w-full bg-[#1A1A1A] border border-border-dark rounded-lg p-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none mb-3"
                      placeholder="Pridať novú poznámku k leadu..."
                    ></textarea>
                    <div className="flex justify-end">
                      <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">Pridať poznámku</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
            <h3 className="text-lg font-bold text-white mb-6">História komunikácie</h3>
            
            <div className="relative pl-4 border-l-2 border-border-dark space-y-8 pb-4">
              
              {/* Item 1 - Fake for now, usually would map over activities */}
              <div className="relative">
                <span className="absolute -left-[25px] flex items-center justify-center w-6 h-6 bg-surface-dark border-2 border-primary rounded-full ring-4 ring-surface-card">
                  <Phone className="w-3 h-3 text-primary" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-white">Úvodný telefonát</h5>
                  <span className="text-xs text-gray-500 font-medium">Dnes, 10:30</span>
                </div>
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[8px] text-white mr-1.5">A</span>
                  Pridal: Admin (Vy)
                </div>
                <div className="bg-[#1A1A1A] border border-border-dark p-3 rounded-lg text-sm text-gray-300">
                  <p>Klient má záujem o kompletnú realizáciu kúpeľne a terasy (Travertín). Dohodnuté predbežné zameranie na budúci týždeň. Potrebné poslať cenník materiálov.</p>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="relative">
                <span className="absolute -left-[25px] flex items-center justify-center w-6 h-6 bg-surface-dark border-2 border-yellow-500 rounded-full ring-4 ring-surface-card">
                  <CheckCircle className="w-3 h-3 text-yellow-500" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-white">Zmena Statusu</h5>
                  <span className="text-xs text-gray-500 font-medium">Dnes, 10:35</span>
                </div>
                <p className="text-sm text-gray-400">Status zmenený z <span className="text-gray-300 font-medium">Nový Dopyt</span> na <span className="text-yellow-500 font-medium">Kontaktovaný</span></p>
              </div>

               {/* Item 3 */}
               <div className="relative">
                <span className="absolute -left-[25px] flex items-center justify-center w-6 h-6 bg-surface-dark border-2 border-gray-500 rounded-full ring-4 ring-surface-card">
                  <Globe className="w-3 h-3 text-gray-400" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-white">Lead Vytvorený</h5>
                  <span className="text-xs text-gray-500 font-medium">{format(new Date(lead.created_at), 'd. MMM yyyy, HH:mm', { locale: sk })}</span>
                </div>
                <p className="text-sm text-gray-400">Lead bol automaticky zaznamenaný zo systému Webový Formulár.</p>
              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
