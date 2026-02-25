"use client";

import { 
  Users, Send, TrendingUp, Filter, Phone, Mail, Handshake, Plus, Expand
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SalesDashboard() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* My Leads */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Moje Leady</p>
              <h3 className="text-3xl font-bold text-white mt-1">24</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-white font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
              8 nových
            </span>
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-gray-400 flex items-center">
              16 kontaktovaných
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500"></div>
        </div>

        {/* Sent Quotes */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Odoslané Ponuky</p>
              <h3 className="text-3xl font-bold text-white mt-1">142 500 €</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
              <Send className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-blue-400 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12%
            </span>
            <span className="text-gray-500 ml-2">oproti minulému mesiacu</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors duration-500"></div>
        </div>

        {/* Monthly Target */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-green-600/30 transition-all duration-300">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Mesačný cieľ</p>
              <h3 className="text-3xl font-bold text-white mt-1">85%</h3>
              <p className="text-xs text-gray-500 mt-1">Cieľ: 200 000 €</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeWidth="3"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm z-10 relative">
            <span className="text-green-500 font-medium">Zostáva 15%</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-600/5 rounded-full group-hover:bg-green-600/10 transition-colors duration-500"></div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Active Deals Table */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-0 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-border-dark flex justify-between items-center bg-[#252525] rounded-t-xl">
            <h3 className="text-lg font-bold text-white">Aktuálne obchodné prípady</h3>
            <div className="flex space-x-2">
              <button className="text-xs text-gray-400 hover:text-primary flex items-center transition-colors">
                Filter <Filter className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-border-dark bg-[#1F1F1F]">
                  <th className="px-6 py-4">Klient / Lead</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pravdepodobnosť</th>
                  <th className="px-6 py-4 text-right">Posledný kontakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {/* Deal 1 */}
                <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/30">
                        JD
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Ján Ďurica</p>
                        <p className="text-xs text-gray-500">Vila Hradný Vrch - Kuchyňa</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-900/50">
                      Ponuka odoslaná
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white mr-2">75%</span>
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-right">Dnes 10:30</td>
                </tr>

                {/* Deal 2 */}
                <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 ring-1 ring-purple-500/30">
                        AS
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Architekti s.r.o.</p>
                        <p className="text-xs text-gray-500">Projekt Residence - Fasáda</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-900/50">
                      Vyjednávanie
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white mr-2">90%</span>
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-right">Včera</td>
                </tr>

                {/* Deal 3 */}
                <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600">
                        MK
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Mária Kráľová</p>
                        <p className="text-xs text-gray-500">Rekonštrukcia bytu</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-500 border border-yellow-900/50">
                      Nový dopyt
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white mr-2">20%</span>
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '20%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-right">2 dni</td>
                </tr>

                {/* Deal 4 */}
                <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600">
                        HT
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Hotel Tatry</p>
                        <p className="text-xs text-gray-500">Wellness obklad</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                      Čaká na odozvu
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white mr-2">40%</span>
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{width: '40%'}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-right">5 dní</td>
                </tr>
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
          
          {/* Today's Activities */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Dnešné aktivity</h3>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded border border-primary/20">4 úlohy</span>
            </div>
            
            <div className="space-y-4">
              {/* Activity 1 */}
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer group">
                <div className="flex-shrink-0 mt-0.5 bg-green-900/30 rounded-full p-1.5 border border-green-900/50">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Volať: Ing. Novák</p>
                  <p className="text-xs text-gray-500 truncate">Follow-up k ponuke #2024-88</p>
                </div>
                <span className="text-xs font-bold text-white bg-surface-darker px-2 py-1 rounded border border-border-dark">14:00</span>
              </div>

              {/* Activity 2 */}
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer group">
                <div className="flex-shrink-0 mt-0.5 bg-blue-900/30 rounded-full p-1.5 border border-blue-900/50">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Odoslať vzorkovník</p>
                  <p className="text-xs text-gray-500 truncate">Pre klienta DesignStudio</p>
                </div>
                <span className="text-xs font-bold text-white bg-surface-darker px-2 py-1 rounded border border-border-dark">15:30</span>
              </div>

              {/* Activity 3 */}
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer group">
                <div className="flex-shrink-0 mt-0.5 bg-amber-900/30 rounded-full p-1.5 border border-amber-900/50">
                  <Handshake className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Stretnutie: Villa Hrad</p>
                  <p className="text-xs text-gray-500 truncate">Prezentácia materiálov</p>
                </div>
                <span className="text-xs font-bold text-white bg-surface-darker px-2 py-1 rounded border border-border-dark">16:00</span>
              </div>
            </div>

            <button className="w-full mt-5 py-2 text-xs font-medium text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center">
              <Plus className="w-4 h-4 mr-1" />
              Pridať aktivitu
            </button>
          </div>

          {/* Weekly Activity */}
          <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4">Týždenná aktivita</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Telefonáty (32)</span>
                  <span>Emaily (58)</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-surface-darker">
                  <div className="bg-primary hover:bg-primary-hover transition-colors h-full" style={{width: '35%'}} title="Telefonáty"></div>
                  <div className="bg-gray-600 hover:bg-gray-500 transition-colors h-full" style={{width: '65%'}} title="Emaily"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-surface-darker p-3 rounded-lg border border-border-dark">
                  <div className="text-xs text-gray-500 uppercase">Hovory</div>
                  <div className="text-xl font-bold text-white mt-1">3h 20m</div>
                </div>
                <div className="bg-surface-darker p-3 rounded-lg border border-border-dark">
                  <div className="text-xs text-gray-500 uppercase">Schôdzky</div>
                  <div className="text-xl font-bold text-white mt-1">5</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
