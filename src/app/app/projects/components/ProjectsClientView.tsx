"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProjectsClientView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-solid border-slate-200 dark:border-zinc-800 bg-background-light dark:bg-[#0a0a0a] px-6 lg:px-8 z-10 text-left">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Prehľad Projektov
            </h1>
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
            onClick={handleLogout}
            className="text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors text-sm font-medium"
          >
            Odhlásiť
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-12 text-left">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header & Actions */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Aktuálne realizácie
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 max-w-2xl">
                Sledujte stav, termíny a zodpovedné osoby pre všetky prebiehajúce zákazky.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(255,102,0,0.2)] uppercase tracking-wider text-xs">
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Nový projekt</span>
              </button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl">engineering</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 z-10">
                Aktívne projekty
              </h3>
              <div className="mt-4 text-4xl font-bold text-slate-900 dark:text-white tracking-tight z-10">
                24
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-red-900/30 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-red-950/20 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity text-red-500">
                <span className="material-symbols-outlined text-8xl">warning</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                V omeškaní
              </h3>
              <div className="mt-4 text-4xl font-bold text-red-600 dark:text-red-400 tracking-tight z-10">
                3
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl">task_alt</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 z-10">
                Dokončené (Tento mesiac)
              </h3>
              <div className="mt-4 text-4xl font-bold text-slate-900 dark:text-white tracking-tight z-10">
                12
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl">trending_up</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 z-10">
                Efektivita tímov
              </h3>
              <div className="mt-4 text-4xl font-bold text-primary tracking-tight z-10">
                94<span className="text-2xl text-zinc-500 font-normal">%</span>
              </div>
            </div>
          </div>

          {/* Filters & Tabs */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-4 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              <button 
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                  activeTab === "all" ? "bg-primary text-black" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                )}
              >
                Všetky
              </button>
              <button 
                onClick={() => setActiveTab("preparation")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2",
                  activeTab === "preparation" ? "bg-primary text-black" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Príprava
              </button>
              <button 
                onClick={() => setActiveTab("mounting")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2",
                  activeTab === "mounting" ? "bg-primary text-black" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Montáž
              </button>
              <button 
                onClick={() => setActiveTab("finishing")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2",
                  activeTab === "finishing" ? "bg-primary text-black" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Dokončovanie
              </button>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-zinc-500 text-lg">search</span>
                <input 
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                  placeholder="Hľadať projekt alebo klienta..." 
                  type="text" 
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span>
              </button>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    <th className="px-6 py-4">ID projektu / Klient</th>
                    <th className="px-6 py-4">Typ realizácie</th>
                    <th className="px-6 py-4">Stav</th>
                    <th className="px-6 py-4">Progres</th>
                    <th className="px-6 py-4">Zodpovedný</th>
                    <th className="px-6 py-4">Termín</th>
                    <th className="px-6 py-4 text-right">Akcie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {/* PRJ-2024-089 */}
                  <tr className="group hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <a className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer" href="#">
                          PRJ-2024-089
                        </a>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Arch. Studio Kováč</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Vila Bratislava - Palisády</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-zinc-500 text-lg">kitchen</span>
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Kuchynská doska</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-200 dark:border-orange-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Montáž
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Krok 4/5</span>
                          <span>80%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-[10px] font-bold border border-blue-800">
                          MK
                        </div>
                        <span className="text-xs text-slate-700 dark:text-zinc-300">M. Kováč</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-white">24. Máj 2024</span>
                        <span className="text-[10px] text-zinc-500">Zostáva 6 dní</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Zobraziť detaily">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Upraviť">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* PRJ-2024-092 */}
                  <tr className="group hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors bg-red-50 dark:bg-red-900/5">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <a className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer" href="#">
                            PRJ-2024-092
                          </a>
                          <span className="material-symbols-outlined text-red-500 text-sm" title="V omeškaní">warning</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Jozef Novák</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Kúpeľňa - obklad</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-zinc-500 text-lg">bathtub</span>
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Kúpeľňa</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Príprava materiálu
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] text-red-500 font-bold mb-1">
                          <span>Krok 2/5</span>
                          <span>40%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-900 text-green-100 flex items-center justify-center text-[10px] font-bold border border-green-800">
                          JH
                        </div>
                        <span className="text-xs text-slate-700 dark:text-zinc-300">J. Hrušková</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-red-600 dark:text-red-400 font-bold">15. Máj 2024</span>
                        <span className="text-[10px] text-red-500">Omeškanie 3 dni</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Zobraziť detaily">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Upraviť">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* PRJ-2024-098 */}
                  <tr className="group hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <a className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer" href="#">
                          PRJ-2024-098
                        </a>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Gastro Services s.r.o.</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Barový pult - Onyx</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-zinc-500 text-lg">local_bar</span>
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Barový pult</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                        Zameranie
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Krok 1/5</span>
                          <span>20%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-400 dark:bg-zinc-500" style={{ width: "20%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-purple-900 text-purple-100 flex items-center justify-center text-[10px] font-bold border border-purple-800">
                          TB
                        </div>
                        <span className="text-xs text-slate-700 dark:text-zinc-300">T. Baláž</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-white">02. Jún 2024</span>
                        <span className="text-[10px] text-zinc-500">Zostáva 15 dní</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Zobraziť detaily">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Upraviť">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* PRJ-2024-075 */}
                  <tr className="group hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <a className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer" href="#">
                          PRJ-2024-075
                        </a>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Hotel Imperial</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Recepcia a lobby</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-zinc-500 text-lg">domain</span>
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Komerčný priestor</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Dokončovanie
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Krok 5/5</span>
                          <span>95%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "95%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center text-[10px] font-bold border border-blue-800">
                          MK
                        </div>
                        <span className="text-xs text-slate-700 dark:text-zinc-300">M. Kováč</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 dark:text-white">20. Máj 2024</span>
                        <span className="text-[10px] text-zinc-500">Zajtra</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Zobraziť detaily">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Upraviť">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex-1"></div>
            <div className="border-t border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400">
              <div>
                Zobrazuje sa <span className="text-slate-900 dark:text-white font-bold">1</span> až <span className="text-slate-900 dark:text-white font-bold">4</span> z <span className="text-slate-900 dark:text-white font-bold">24</span> projektov
              </div>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 cursor-not-allowed">
                  Predošlé
                </button>
                <button className="px-3 py-1 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors text-slate-900 dark:text-white">
                  Ďalšie
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
