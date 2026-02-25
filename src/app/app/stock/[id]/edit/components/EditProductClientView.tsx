"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useInventoryItem, useUpdateInventoryItem } from "@/hooks/useInventory";
import { toast } from "sonner";
import type { InventoryItem } from "@/types/database";
import { ArrowLeft, Bell, Save, Info, Tag, Sliders, Package, Warehouse, Image as ImageIcon, UploadCloud, RefreshCw, Wallet, Ruler, Globe, Layers } from "lucide-react";

type TabValue = "basic" | "pricing" | "specs";

export function EditProductClientView({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabValue>("basic");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    sku: "",
    category_id: "",
    sale_price: 0,
    purchase_price: 0,
    qty_available: 0,
    min_stock: 0,
    unit: "ks",
    notes: "",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: product, isLoading, isError } = useInventoryItem(productId);

  // Populate form when data loads
  useEffect(() => {
    if (product) {
      // Ensure we don't overwrite user edits if data refetches, only set it on initial load
      setFormData(prev => {
        if (!prev.id && product.id) {
          return product;
        }
        return prev;
      });
    }
  }, [product]);


  const updateMutation = useUpdateInventoryItem();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingFile(true);
      let finalImageUrl = formData.image_url;

      if (newImageFile) {
        // Delete old image if it exists in DB
        if (product?.image_url) {
          try {
            const urlParts = product.image_url.split('/products/');
            if (urlParts.length > 1) {
                const oldPath = urlParts[1];
                await supabase.storage.from('products').remove([oldPath]);
            }
          } catch(e) {
             console.error("Failed to delete old image", e);
          }
        }

        // Upload new image
        const fileExt = newImageFile.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newImageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
      }

      // Explicitly pull only the editable fields preventing un-editable db columns (created_at, category, etc.) from rejecting the query
      const updates = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id || null, // Handle empty string as null
        qty_available: formData.qty_available,
        min_stock: formData.min_stock,
        purchase_price: formData.purchase_price,
        sale_price: formData.sale_price,
        notes: formData.notes,
        unit: formData.unit,
        image_url: finalImageUrl,
      };
      
      await updateMutation.mutateAsync({ id: productId, ...updates });
      toast.success("Zmeny boli úspešne uložené.");
      router.push('/app/stock');
    } catch (error: any) {
      toast.error(`Chyba pri ukladaní: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
  };


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
            <button onClick={() => router.push("/app/stock")} className="px-6 py-2 bg-primary text-black font-bold uppercase tracking-wider text-xs">
                Späť na Sklad
            </button>
        </div>
      </div>
    );
  }

  // Removed hacky workaround, handled by useEffect now

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-solid border-slate-200 dark:border-zinc-800 bg-background-light dark:bg-[#0a0a0a] px-6 lg:px-8 z-10 text-left">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/app/stock`)} className="text-zinc-500 hover:text-primary transition-colors flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Upraviť produkt
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">
              {product.sku || product.id.substring(0,8).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-[#0a0a0a]"></span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-12 text-left">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto w-full">
            
            {/* Action Bar */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                        {product.name}
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400">
                        Upravte informácie, ceny a špecifikácie produktu.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-zinc-500 mr-2">Posledná úprava: dnes</span>
                    <button type="submit" disabled={updateMutation.isPending || uploadingFile} className="px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider text-xs hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(255,102,0,0.2)] disabled:opacity-50 flex items-center gap-2">
                        {updateMutation.isPending || uploadingFile ? 'Ukladám...' : 'ULOŽIŤ ZMENY'}
                        <Save className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            activeTab === "basic"
                                ? "border-primary text-primary font-bold shadow-[0_1px_0_0_#ff6600]"
                                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300 hover:border-zinc-300"
                        }`}
                        >
                        <Info className="w-4 h-4" />
                        Základné info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("pricing")}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            activeTab === "pricing"
                                ? "border-primary text-primary font-bold shadow-[0_1px_0_0_#ff6600]"
                                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300 hover:border-zinc-300"
                        }`}
                        >
                        <Tag className="w-4 h-4" />
                        Cenotvorba
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("specs")}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            activeTab === "specs"
                                ? "border-primary text-primary font-bold shadow-[0_1px_0_0_#ff6600]"
                                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300 hover:border-zinc-300"
                        }`}
                        >
                        <Sliders className="w-4 h-4" />
                        Technické špecifikácie
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            {activeTab === "basic" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-primary/50 p-8 shadow-sm h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                                <Package className="w-32 h-32 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Package className="w-5 h-5 text-primary" />
                                Hlavné údaje
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Názov produktu *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">SKU Kód</label>
                                        <input 
                                            type="text" 
                                            value={formData.sku || ''}
                                            onChange={(e) => handleInputChange("sku", e.target.value)}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-mono" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Jednotka</label>
                                        <select 
                                            value={formData.unit || 'ks'}
                                            onChange={(e) => handleInputChange("unit", e.target.value)}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                        >
                                            <option value="ks">Slab (ks)</option>
                                            <option value="m2">m²</option>
                                            <option value="bm">Bežný meter (bm)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Kategória</label>
                                        <select 
                                            value={formData.category_id || ''}
                                            onChange={(e) => handleInputChange("category_id", e.target.value)}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                        >
                                            <option value="">Nevybraná</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Krátky popis / Poznámka</label>
                                        <textarea 
                                            rows={4}
                                            value={formData.notes || ''}
                                            onChange={(e) => handleInputChange("notes", e.target.value)}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm resize-none" 
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-amber-500/50 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none -rotate-12">
                                <Warehouse className="w-32 h-32 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Warehouse className="w-5 h-5 text-amber-500" />
                                Skladové informácie
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Aktuálny stav ({formData.unit})</label>
                                        <input 
                                            type="number" 
                                            value={formData.qty_available || 0}
                                            onChange={(e) => handleInputChange("qty_available", parseFloat(e.target.value))}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-mono" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Min. zásoba ({formData.unit})</label>
                                        <input 
                                            type="number" 
                                            value={formData.min_stock || 0}
                                            onChange={(e) => handleInputChange("min_stock", parseFloat(e.target.value))}
                                            className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-mono" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-primary/50 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                                <ImageIcon className="w-32 h-32 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                Prezentácia
                            </h3>
                            <label className="flex flex-col justify-center items-center p-8 border-2 border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group relative overflow-hidden min-h-[200px] z-10">
                                {previewUrl || formData.image_url ? (
                                    <>
                                        <img src={previewUrl || formData.image_url || ''} alt="Náhľad" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4" />
                                                Zmeniť fotku
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center z-10 select-none">
                                        <UploadCloud className="w-10 h-10 mb-3 text-zinc-400 group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {uploadingFile ? "Nahrávam obrázok..." : "Kliknite pre nahratie obrázka"}
                                        </span>
                                        <span className="text-xs text-zinc-500 mt-1">PNG, JPG do 5MB</span>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={updateMutation.isPending || uploadingFile} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "pricing" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-primary/50 p-8 shadow-sm h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                                <Tag className="w-32 h-32 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Tag className="w-5 h-5 text-primary" />
                                Predajné Ceny
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex justify-between">
                                        <span>Predajná cena (B2C)</span>
                                        <span className="text-primary tracking-widest">VRÁTANE DPH</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.sale_price !== null && formData.sale_price !== undefined ? formData.sale_price * 1.2 : ''}
                                            onChange={(e) => handleInputChange("sale_price", parseFloat(e.target.value) / 1.2)}
                                            className="block w-full border-0 py-4 pl-10 pr-4 text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" 
                                        />
                                    </div>
                                </div>
                                <div className="h-[1px] w-full bg-slate-100 dark:bg-zinc-800 my-4"></div>
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex justify-between">
                                        <span>Základná predajná cena (BEZ DPH)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.sale_price || ''}
                                            onChange={(e) => handleInputChange("sale_price", parseFloat(e.target.value))}
                                            className="block w-full border-0 py-3 pl-10 pr-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-mono opacity-80" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-amber-500/50 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none -rotate-12">
                                <Wallet className="w-32 h-32 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Wallet className="w-5 h-5 text-amber-500" />
                                Nákupná cena
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Nákupná cena od dodávateľa</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.purchase_price || ''}
                                            onChange={(e) => handleInputChange("purchase_price", parseFloat(e.target.value))}
                                            className="block w-full border-0 py-3 pl-10 pr-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm font-mono text-zinc-400 dark:text-zinc-500 focus:text-white transition-colors" 
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-zinc-500 uppercase tracking-widest">Tento údaj je interný a nebude viditeľný na faktúrach klienta.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "specs" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* The HTML from user explicitly defines two blocks "Fyzikálne vlastnosti" and "Povrch a odolnosť" */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-primary/50 p-8 shadow-sm h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                                <Ruler className="w-32 h-32 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Ruler className="w-5 h-5 text-primary" />
                                Fyzikálne vlastnosti
                            </h3>
                            <div className="space-y-6 opacity-60 pointer-events-none relative z-10">
                                {/* Disabled inputs demonstrating the future spec system */}
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Pôvod materiálu</label>
                                    <div className="relative flex items-center">
                                        <Globe className="absolute left-3 w-5 h-5 text-zinc-500" />
                                        <input className="block w-full border-0 py-3 pl-10 pr-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 placeholder:text-zinc-400" placeholder="e.g. Taliansko" type="text" value="Taliansko" readOnly/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Typ kameňa</label>
                                    <input className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700" type="text" value="Metamorfná hornina" readOnly/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Rozmery (cm)</label>
                                        <input className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 placeholder:text-zinc-400" placeholder="280x160" type="text" readOnly/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Hrúbka (mm)</label>
                                        <input className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 placeholder:text-zinc-400" placeholder="20" type="number" readOnly/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Hmotnosť (kg/m²)</label>
                                    <input className="block w-full border-0 py-3 px-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-900 ring-1 ring-inset ring-slate-200 dark:ring-zinc-700 placeholder:text-zinc-400" placeholder="55" type="number" readOnly/>
                                </div>
                                <div className="text-xs text-primary mt-4 font-bold uppercase tracking-widest text-center py-2 bg-primary/10 border border-primary/20">Modul vo vývoji</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 border-t-2 border-t-amber-500/50 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none -rotate-12">
                                <Layers className="w-32 h-32 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-3 relative z-10">
                                <Layers className="w-5 h-5 text-amber-500" />
                                Povrch a odolnosť
                            </h3>
                            <div className="space-y-6 opacity-60 pointer-events-none">
                                <div>
                                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Povrchová úprava</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative flex items-start">
                                            <div className="flex h-6 items-center">
                                                <input checked className="h-4 w-4 rounded border-zinc-700 text-primary bg-zinc-900" type="checkbox" readOnly />
                                            </div>
                                            <div className="ml-3 text-sm leading-6">
                                                <label className="font-medium text-slate-900 dark:text-white">Leštený</label>
                                            </div>
                                        </div>
                                        <div className="relative flex items-start">
                                            <div className="flex h-6 items-center">
                                                <input checked className="h-4 w-4 rounded border-zinc-700 text-primary bg-zinc-900" type="checkbox" readOnly/>
                                            </div>
                                            <div className="ml-3 text-sm leading-6">
                                                <label className="font-medium text-slate-900 dark:text-white">Matný</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </form>
      </main>
    </div>
  );
}
