"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/types/database";

// This is a placeholder icon mapping if needed.
const getCategoryIcon = (categoryId: string | null) => {
    return "inventory_2";
};

export function ProductDetailClientView({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["inventory-item", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          category:inventory_categories(id, name),
          supplier:suppliers(id, name)
        `)
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Načítavam produkt...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <h2 className="text-2xl font-bold mb-2">Produkt nenájdený</h2>
            <p className="text-zinc-500 mb-6">Požadovaný produkt sa nenašiel alebo nemáte k nemu prístup.</p>
            <button onClick={() => router.push("/app/stock")} className="px-6 py-2 bg-primary text-black font-bold uppercase tracking-wider text-xs">
                Späť na Sklad
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-solid border-slate-200 dark:border-zinc-800 bg-background-light dark:bg-[#0a0a0a] px-6 lg:px-8 z-10 text-left">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/app/stock")} className="text-zinc-500 hover:text-primary transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Detail Produktu
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">
              {product.sku || product.id.substring(0,8).toUpperCase()}
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
              supabase.auth.signOut().then(() => router.push("/login"));
            }}
            className="text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors text-sm font-medium"
          >
            Odhlásiť
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-12 text-left">
        <div className="max-w-5xl mx-auto w-full">
            
            {/* Action Bar */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Na sklade
                        </span>
                        <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{product.category?.name || 'Nezaradené'}</span>
                    </div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                        {product.name}
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400 max-w-2xl">
                        {product.description || 'Žiadny popis nebol pridaný k tomuto produktu. Tieto informácie slúžia pre interné potreby správy skladu.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => router.push(`/app/stock/${product.id}/edit`)} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider text-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Upraviť
                    </button>
                    <button className="px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider text-xs hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(255,102,0,0.2)] flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                        Rezervovať
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images & Key Data */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Image Gallery */}
                    <div className="bg-slate-100 dark:bg-zinc-900 aspect-video w-full flex items-center justify-center border border-slate-200 dark:border-zinc-800 relative group overflow-hidden">
                        {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="flex flex-col items-center text-zinc-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">image</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Žiadny obrázok</span>
                            </div>
                        )}
                        <button className="absolute bottom-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-colors opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-outlined">zoom_in</span>
                        </button>
                    </div>

                    {/* Stock Overview Table */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            Stav zásob
                        </h3>
                        <div className="border border-slate-100 dark:border-zinc-800/60 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                        <th className="px-4 py-3">Lokácia</th>
                                        <th className="px-4 py-3">Skladom</th>
                                        <th className="px-4 py-3">Rezervované</th>
                                        <th className="px-4 py-3 text-right">Dostupné</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                    <tr className="text-sm">
                                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">Hlavný sklad BA</td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-zinc-400 font-mono">{product.quantity} m²</td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-zinc-400 font-mono">0 m²</td>
                                        <td className="px-4 py-4 text-emerald-600 dark:text-emerald-500 font-mono font-bold text-right">{product.quantity} m²</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Pricing */}
                <div className="space-y-8">
                    {/* Pricing Card */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent pointer-events-none"></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Cenotvorba
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Predajná cena (B2C)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">€{(product.price_b2c || product.price || 0).toFixed(2)}</span>
                                    <span className="text-sm text-zinc-500 mb-1">/ {product.unit}</span>
                                </div>
                            </div>
                            
                            <div className="h-[1px] w-full bg-slate-100 dark:bg-zinc-800/60"></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Veľkoobchod (B2B)</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-zinc-300 font-mono">
                                        €{(product.price_b2b || product.price || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Nákupná cena</p>
                                    <p className="text-lg font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                                        €{(product.cost_price || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Hrubá marža (B2C)</span>
                                    <span className="text-sm font-bold text-primary">
                                        {product.price_b2c && product.cost_price 
                                          ? `${(((product.price_b2c - product.cost_price) / product.price_b2c) * 100).toFixed(1)}%`
                                          : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specification Card */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">tune</span>
                            Špecifikácia
                        </h3>
                        
                        <dl className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
                                <dt className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider">SKU kód</dt>
                                <dd className="text-sm font-bold text-slate-900 dark:text-white font-mono">{product.sku || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
                                <dt className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Min. stav. zásob</dt>
                                <dd className="text-sm font-bold text-orange-500 font-mono">{product.min_quantity || 0} {product.unit}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
                                <dt className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Dodávateľ</dt>
                                <dd className="text-sm font-bold text-slate-900 dark:text-white">{product.supplier?.name || "Nezaradené"}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
                                <dt className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Typ merania</dt>
                                <dd className="text-sm font-bold text-slate-900 dark:text-white">{product.unit.toUpperCase()}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
                                <dt className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Dátum pridania</dt>
                                <dd className="text-sm font-bold text-slate-900 dark:text-white font-mono">{new Date(product.created_at).toLocaleDateString('sk-SK')}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
            
        </div>
      </main>
    </div>
  );
}
