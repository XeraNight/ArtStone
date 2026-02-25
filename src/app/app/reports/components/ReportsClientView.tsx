"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ReportsClientView() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black text-slate-100 font-display selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-zinc-900 bg-black px-6 lg:px-8">
        <div className="flex items-center">
          <h2 className="text-xl font-bold tracking-tight uppercase text-white">
            Finančný Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-zinc-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">
              notifications
            </span>
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-black"></span>
          </button>
          <div className="h-5 w-[1px] bg-zinc-800"></div>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-primary transition-colors text-sm font-medium"
          >
            Odhlásiť
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-8">
        <div className="flex flex-col gap-8 max-w-[1920px] mx-auto w-full">
          {/* Title & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-zinc-900">
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase text-white">
                Finančný a Skladový Report
              </h1>
              <p className="text-zinc-500 mt-1">
                Konsolidovaný prehľad financií a zásob
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium border border-zinc-800 hover:border-zinc-700">
                  <span className="material-symbols-outlined text-lg text-primary">
                    calendar_month
                  </span>
                  <span className="text-zinc-400">
                    Obdobie:{" "}
                    <span className="text-white ml-1 font-bold">
                      Tento Mesiac
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-lg text-zinc-500">
                    expand_more
                  </span>
                </button>
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-black font-bold hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(255,102,0,0.2)] uppercase tracking-wider text-xs ml-2">
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[#0a0a0a] border border-[#1f1f1f] divide-y md:divide-y-0 md:divide-x divide-[#1f1f1f]">
            <div className="p-8 flex flex-col items-center justify-center text-center group">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Tržby (Revenue)
              </h3>
              <div className="text-5xl font-bold text-white tracking-tight mb-2 group-hover:text-zinc-200 transition-colors">
                € 342,800
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                <span>+12.4%</span>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-zinc-700 font-light hidden md:block">
                -
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Náklady (Costs)
              </h3>
              <div className="text-5xl font-bold text-zinc-300 tracking-tight mb-2 group-hover:text-white transition-colors">
                € 194,600
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-red-500">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                <span>+5.2%</span>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center group relative bg-zinc-900/30">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-zinc-700 font-light hidden md:block">
                =
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Čistý zisk (Net Profit)
              </h3>
              <div className="text-5xl font-bold text-primary tracking-tight mb-2 shadow-primary/20 drop-shadow-lg">
                € 148,200
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-zinc-400">
                <span>Marža: 43.2%</span>
              </div>
            </div>
          </div>

          {/* Charts and Inventory Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] p-6 shadow-sm relative group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                    Vývoj Tržieb vs. Náklady
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Porovnanie finančnej efektivity v čase
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span className="text-zinc-400">Tržby</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 bg-zinc-600 rounded-full"></span>
                    <span className="text-zinc-400">Náklady</span>
                  </div>
                  <div className="h-4 w-[1px] bg-zinc-800"></div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-bold bg-zinc-800 text-white border border-zinc-700">
                      7D
                    </button>
                    <button className="px-3 py-1 text-xs font-bold bg-primary text-black">
                      30D
                    </button>
                  </div>
                </div>
              </div>
              {/* Graph Container */}
              <div className="h-64 w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-zinc-800 h-0 w-full"></div>
                  <div className="border-b border-zinc-800 h-0 w-full"></div>
                  <div className="border-b border-zinc-800 h-0 w-full"></div>
                  <div className="border-b border-zinc-800 h-0 w-full"></div>
                  <div className="border-b border-zinc-800 h-0 w-full"></div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-zinc-600 font-mono -ml-6">
                  <span>100k</span>
                  <span>75k</span>
                  <span>50k</span>
                  <span>25k</span>
                  <span>0</span>
                </div>
                <svg
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 250"
                >
                  <defs>
                    <linearGradient
                      id="gradient-line"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ff6600"
                        stopOpacity="0.2"
                      ></stop>
                      <stop
                        offset="100%"
                        stopColor="#ff6600"
                        stopOpacity="0"
                      ></stop>
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,200 C50,180 100,210 150,160 C200,110 250,140 300,100 C350,60 400,90 450,70 C500,50 550,80 600,40 C650,0 700,30 750,50 L750,250 L0,250 Z"
                    fill="url(#gradient-line)"
                    stroke="none"
                  ></path>
                  <path
                    d="M0,200 C50,180 100,210 150,160 C200,110 250,140 300,100 C350,60 400,90 450,70 C500,50 550,80 600,40 C650,0 700,30 750,50"
                    fill="none"
                    stroke="#ff6600"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M0,230 C50,220 100,230 150,200 C200,180 250,190 300,160 C350,140 400,150 450,130 C500,120 550,130 600,100 C650,90 700,110 750,120"
                    fill="none"
                    stroke="#52525b"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  ></path>
                  <circle
                    className="hover:r-6 transition-all cursor-pointer"
                    cx="300"
                    cy="100"
                    fill="#000"
                    r="4"
                    stroke="#ff6600"
                    strokeWidth="2"
                  ></circle>
                  <circle
                    className="hover:r-6 transition-all cursor-pointer"
                    cx="600"
                    cy="40"
                    fill="#000"
                    r="4"
                    stroke="#ff6600"
                    strokeWidth="2"
                  ></circle>
                </svg>
                {/* Tooltip Overlay (Static for design) */}
                <div className="absolute top-[20px] left-[60%] bg-zinc-900 border border-zinc-700 p-3 rounded shadow-xl z-10 pointer-events-none hidden md:block">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
                    18. Máj
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-xs text-zinc-400">Tržby:</span>
                    <span className="text-xs font-bold text-white">
                      € 28,450
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mt-1">
                    <span className="text-xs text-zinc-400">Náklady:</span>
                    <span className="text-xs font-bold text-zinc-300">
                      € 14,200
                    </span>
                  </div>
                  <div className="border-t border-zinc-700 mt-2 pt-1 flex justify-between gap-4">
                    <span className="text-xs text-primary font-bold">Zisk:</span>
                    <span className="text-xs font-bold text-primary">
                      € 14,250
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Skladové zásoby (Inventory Status) */}
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 shadow-sm flex-1 flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                    Skladové zásoby
                  </h3>
                  <span className="material-symbols-outlined text-zinc-600">
                    inventory
                  </span>
                </div>
                <div className="flex flex-col gap-6 z-10">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Celkom na sklade
                    </div>
                    <div className="text-3xl font-bold text-white">
                      1,248{" "}
                      <span className="text-base font-normal text-zinc-500">
                        panelov
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                      Rezervované (Ponuky)
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-800 text-[10px] text-zinc-400 cursor-help"
                        title="Panely blokované v odoslaných cenových ponukách"
                      >
                        ?
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      482{" "}
                      <span className="text-base font-normal text-zinc-500">
                        panelov
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 mt-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: "38%" }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 text-right">
                      38% kapacity rezervované
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-5">
                  <span className="material-symbols-outlined text-[180px]">
                    pallet
                  </span>
                </div>
              </div>

              {/* Hodnota odoslaných ponúk */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-white">
                    request_quote
                  </span>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 z-10">
                  Hodnota odoslaných ponúk
                </h3>
                <div className="mt-2 text-3xl font-bold text-white tracking-tight z-10">
                  € 185,400
                </div>
                <div className="mt-2 text-xs text-zinc-400 z-10 max-w-[80%]">
                  Tieto ponuky blokujú{" "}
                  <span className="text-primary font-bold">482</span> panelov.
                  Pravdepodobnosť uzavretia:{" "}
                  <span className="text-white font-bold">65%</span>.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Category Sales & Active Salespeople */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                  Predaj podľa kategórie (Tržby)
                </h3>
              </div>
              <div className="space-y-4">
                <div className="w-full group cursor-pointer">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Mramor</span>
                    <span className="text-zinc-400">€ 154,260 (45%)</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%] group-hover:bg-white transition-colors"></div>
                  </div>
                </div>
                <div className="w-full group cursor-pointer">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Bridlica</span>
                    <span className="text-zinc-400">€ 95,984 (28%)</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/80 w-[28%] group-hover:bg-white transition-colors"></div>
                  </div>
                </div>
                <div className="w-full group cursor-pointer">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">Travertín</span>
                    <span className="text-zinc-400">€ 51,420 (15%)</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 w-[15%] group-hover:bg-white transition-colors"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] shadow-sm">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                  Aktívni Obchodníci
                </h3>
                <button className="text-xs text-primary font-bold hover:text-white uppercase tracking-wider transition-colors">
                  Detail
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-3">Meno</th>
                      <th className="px-6 py-3 text-right">Obrat</th>
                      <th className="px-6 py-3 text-right">Marža</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr className="group hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-white">
                        Martin Kováč
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-zinc-300">
                        € 124,500
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-primary font-bold">
                        45%
                      </td>
                    </tr>
                    <tr className="group hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-white">
                        Jana Hrušková
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-zinc-300">
                        € 98,200
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-primary font-bold">
                        41%
                      </td>
                    </tr>
                    <tr className="group hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-bold text-white">
                        Peter Baláž
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-zinc-300">
                        € 65,400
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-primary font-bold">
                        38%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
