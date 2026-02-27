"use client";

import { 
  Users, Building2, Package, CheckCircle, Clock, AlertTriangle, 
  ArrowRight, Plus, Bell, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ManagerDashboard() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header handled by parent, here we just show the content grids */}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Team Performance */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Výkon tímu</p>
              <h3 className="text-3xl font-bold text-white mt-1">94%</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-green-400 font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Všetky úlohy
            </span>
            <span className="text-gray-500 ml-2">plnené v termíne</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500"></div>
        </div>

        {/* Active Projects */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Aktívne projekty</p>
              <h3 className="text-3xl font-bold text-white mt-1">8</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-blue-400 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              2 projekty
            </span>
            <span className="text-gray-500 ml-2">blízko dokončenia</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors duration-500"></div>
        </div>

        {/* Stock Status */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 relative overflow-hidden group hover:border-amber-600/30 transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">Stav skladu</p>
              <h3 className="text-3xl font-bold text-white mt-1">Upozornenie</h3>
            </div>
            <div className="p-2 bg-amber-600/10 rounded-lg border border-amber-600/10">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm z-10 relative">
            <span className="text-amber-500 font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Nízke zásoby
            </span>
            <span className="text-gray-500 ml-2">pre 2 materiály</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-600/5 rounded-full group-hover:bg-amber-600/10 transition-colors duration-500"></div>
        </div>

      </div>

      {/* Row 2: Team Tasks Overview & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Team Tasks Progress */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Prehľad úloh tímu</h3>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-xs text-gray-400">Dokončené</span>
              <span className="inline-block w-3 h-3 rounded-full bg-gray-600 ml-2"></span>
              <span className="text-xs text-gray-400">Plánované</span>
            </div>
          </div>
          <div className="space-y-6">
            {/* Team A */}
            <div className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">Dizajnérsky Tím (Michal, Jana)</span>
                <span className="text-xs text-gray-400">12 / 15 úloh</span>
              </div>
              <div className="w-full bg-surface-darker rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
            
            {/* Team B */}
            <div className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">Realizačný Tím A (Tomáš, Peter)</span>
                <span className="text-xs text-gray-400">8 / 10 úloh</span>
              </div>
              <div className="w-full bg-surface-darker rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
            
            {/* Team C */}
            <div className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">Realizačný Tím B (Martin, Lukáš)</span>
                <span className="text-xs text-gray-400">15 / 15 úloh</span>
              </div>
              <div className="w-full bg-surface-darker rounded-full h-2.5 overflow-hidden">
                <div className="bg-green-500 h-2.5 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            {/* Logistics */}
            <div className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">Logistika a Sklad (Jozef)</span>
                <span className="text-xs text-gray-400">4 / 8 úloh</span>
              </div>
              <div className="w-full bg-surface-darker rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{width: '50%'}}></div>
              </div>
            </div>

             {/* External */}
             <div className="group">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-white">Externí dodávatelia</span>
                <span className="text-xs text-gray-400">2 / 5 úloh</span>
              </div>
              <div className="w-full bg-surface-darker rounded-full h-2.5 overflow-hidden">
                <div className="bg-gray-600 h-2.5 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border-dark flex justify-between items-center text-sm">
            <span className="text-gray-400">Celkový progres týždňa</span>
            <span className="text-white font-bold">78%</span>
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6">
          <h3 className="text-lg font-bold text-white mb-6">Najbližšie termíny</h3>
          <div className="space-y-4">
            
            {/* Item 1 */}
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer">
              <div className="flex-shrink-0 mt-0.5 text-center w-10">
                <span className="block text-xs text-red-400 font-bold uppercase">DNES</span>
                <span className="block text-lg font-bold text-white">14:00</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Odovzdanie Rezidencie Hrad</p>
                <p className="text-xs text-gray-500 truncate">Finálna kontrola s klientom</p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">Urgentné</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer">
              <div className="flex-shrink-0 mt-0.5 text-center w-10">
                <span className="block text-xs text-primary font-bold uppercase">Zajtra</span>
                <span className="block text-lg font-bold text-white">09:30</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Porada tímu - Nový projekt</p>
                <p className="text-xs text-gray-500 truncate">Kancelária 204</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer">
              <div className="flex-shrink-0 mt-0.5 text-center w-10">
                <span className="block text-xs text-gray-400 font-bold uppercase">Štv</span>
                <span className="block text-lg font-bold text-white">11:00</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Dodávka kameňa - Taliansko</p>
                <p className="text-xs text-gray-500 truncate">Sklad B - potrebná asistencia</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark cursor-pointer">
              <div className="flex-shrink-0 mt-0.5 text-center w-10">
                <span className="block text-xs text-gray-400 font-bold uppercase">Pia</span>
                <span className="block text-lg font-bold text-white">15:00</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Uzávierka mesiaca</p>
                <p className="text-xs text-gray-500 truncate">Reporty výkonnosti</p>
              </div>
            </div>

          </div>
          
          <button className="w-full mt-4 py-2 text-xs font-medium text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center">
            <Plus className="w-4 h-4 mr-1" />
            Pridať pripomienku
          </button>
        </div>
      </div>

      {/* Row 3: Ongoing Projects & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ongoing Projects Table */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-border-dark flex justify-between items-center bg-[#252525]">
            <h3 className="text-lg font-bold text-white">Prebiehajúce projekty</h3>
            <button className="text-sm text-primary hover:text-white transition-colors font-medium flex items-center">
              Všetky projekty 
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-border-dark bg-[#1F1F1F]">
                  <th className="px-6 py-4">Projekt</th>
                  <th className="px-6 py-4">Vedúci</th>
                  <th className="px-6 py-4">Fáza</th>
                  <th className="px-6 py-4 text-right">Termín</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {/* Project 1 */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600 overflow-hidden">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Villa Borovica</p>
                        <p className="text-xs text-gray-500">Exteriér a terasa</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">Tomáš K.</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 w-24">
                      <div className="bg-primary h-1.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Inštalácia</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">30. Nov</td>
                </tr>

                {/* Project 2 */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600 overflow-hidden">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Showroom Centrum</p>
                        <p className="text-xs text-gray-500">Interiérový obklad</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">Michal B.</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 w-24">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Príprava</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">15. Dec</td>
                </tr>

                {/* Project 3 */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600 overflow-hidden">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Chata Donovaly</p>
                        <p className="text-xs text-gray-500">Krb a podlahy</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">Jana M.</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 w-24">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{width: '95%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Dokončovanie</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">Zajtra</td>
                </tr>

                {/* Project 4 */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 ring-1 ring-gray-600 overflow-hidden">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Office Park II</p>
                        <p className="text-xs text-gray-500">Vstupná hala</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">Peter H.</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 w-24">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '10%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Návrh</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">Jan 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-surface-card rounded-xl shadow-lg border border-border-dark p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Skladové upozornenia</h3>
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            {/* Alert 1 */}
            <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                <h4 className="font-bold text-red-400 text-sm tracking-wide">Mramor Carrara</h4>
                <span className="bg-red-950 text-red-400 border border-red-900/50 text-xs px-2 py-0.5 rounded">Kritické</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 ml-2 pr-2">
                <div className="bg-red-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{width: '8%'}}></div>
              </div>
              <p className="text-xs text-gray-400 pl-2">Stav: 5m². Rezervované pre 'Villa Borovica'.</p>
            </div>

            {/* Alert 2 */}
            <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600"></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                <h4 className="font-bold text-amber-500 text-sm tracking-wide">Žula Absolute Black</h4>
                <span className="bg-amber-950 text-amber-500 border border-amber-900/50 text-xs px-2 py-0.5 rounded">Nízke</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 ml-2 pr-2">
                <div className="bg-amber-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]" style={{width: '22%'}}></div>
              </div>
              <p className="text-xs text-gray-400 pl-2">Stav: 25m². Postačuje na 1 týždeň.</p>
            </div>

            {/* Alert 3 */}
            <div className="bg-[#1A1A1A] border border-border-dark rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-300 text-sm tracking-wide">Lepidlo Flexi C2</h4>
                <span className="bg-gray-800 text-gray-400 border border-gray-700 text-xs px-2 py-0.5 rounded">Spotrebný</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Zásoba klesla pod 20 vriec.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
