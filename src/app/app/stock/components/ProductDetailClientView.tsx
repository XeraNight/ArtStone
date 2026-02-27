"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
      </header>

      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-12 text-left">
        <div className="max-w-5xl mx-auto w-full">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                        {product.name}
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400 max-w-2xl">
                        {product.description || 'Žiadny popis nebol pridaný k tomuto produktu.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => router.push(`/app/stock/${product.id}/edit`)} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider text-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Upraviť
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-100 dark:bg-zinc-900 aspect-video w-full flex items-center justify-center border border-slate-200 dark:border-zinc-800 relative group overflow-hidden">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-zinc-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">image</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Žiadny obrázok</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
