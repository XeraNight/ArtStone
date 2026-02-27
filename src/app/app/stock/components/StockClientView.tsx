"use client";

import { useState } from "react";
import type { InventoryItem } from "@/types/database";
import { useInventoryItems, useInventoryCategories, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useAdjustStock } from "@/hooks/useInventory";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Package, Plus, Search, AlertTriangle, TrendingDown, ArrowUpRight, TrendingUp, Filter, Download, Box, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function StockClientView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", unit: "m²", qty_available: 0, min_stock: 0, sale_price: 0, supplier: "" });

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<"add" | "remove">("add");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  const { data: items, isLoading } = useInventoryItems({ search: debouncedSearch, lowStock: showLowStock, categoryId: selectedCategoryId || undefined });
  const { data: categories } = useInventoryCategories();
  const createItem = useCreateInventoryItem();
  const adjustMutation = useAdjustStock();
  const deleteMutation = useDeleteInventoryItem();

  if (isLoading) return <PageSkeleton />;

  const lowStockCount = items?.filter(i => (i.qty_available - i.qty_reserved) < i.min_stock).length ?? 0;
  
  // Calculate total value
  const totalValue = items?.reduce((sum, item) => sum + (item.qty_available * (item.sale_price || 0)), 0) || 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createItem.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", sku: "", unit: "m²", qty_available: 0, min_stock: 0, sale_price: 0, supplier: "" });
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustItem || !adjustAmount) return;
    
    const amount = Number(adjustAmount);
    const adjustment = adjustMode === "add" ? amount : -amount;
    
    await adjustMutation.mutateAsync({ itemId: adjustItem.id, adjustment });
    setAdjustItem(null);
    setAdjustAmount("");
  }

  async function handleDelete() {
    if (!deleteItem) return;
    await deleteMutation.mutateAsync({ id: deleteItem.id });
    setDeleteItem(null);
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Správa Skladu</h1>
          <p className="mt-1 text-sm text-text-secondary">Prehľad a správa skladových zásob a materiálov.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-t border-t-gray-500 border-x-gray-600 border-b border-b-black text-gray-200 hover:text-white bg-steel hover:bg-steel-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] transition-all" onClick={() => {}}>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Nový Príjem
          </Button>

          {/* Create Item Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none shadow-glow-strong bg-gradient-to-b from-primary-light to-primary hover:from-primary hover:to-primary-hover border border-primary-light text-white font-bold">
                <Plus className="w-4 h-4 mr-2" /> Pridať Položku
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-dark border-border-dark text-foreground">
              <DialogHeader>
                <DialogTitle>Nová skladová položka</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Názov *</Label>
                    <Input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div>
                    <Label>Dostupné množstvo</Label>
                    <Input type="number" step="0.01" value={form.qty_available} onChange={e => setForm(f => ({...f, qty_available: parseFloat(e.target.value)}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div>
                    <Label>Min. množstvo</Label>
                    <Input type="number" step="0.01" value={form.min_stock} onChange={e => setForm(f => ({...f, min_stock: parseFloat(e.target.value)}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div>
                    <Label>Jednotka</Label>
                    <Input value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div>
                    <Label>Cena / j.</Label>
                    <Input type="number" step="0.01" value={form.sale_price} onChange={e => setForm(f => ({...f, sale_price: parseFloat(e.target.value)}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                  <div className="col-span-2">
                    <Label>Dodávateľ</Label>
                    <Input value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))} className="mt-1 bg-surface-card border-border-dark" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" className="border-border-dark text-white" onClick={() => setOpen(false)}>Zrušiť</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold" disabled={createItem.isPending}>
                    {createItem.isPending ? "Ukladám..." : "Pridať"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Adjust Stock Dialog */}
          <Dialog open={!!adjustItem} onOpenChange={(open) => !open && setAdjustItem(null)}>
            <DialogContent className="bg-surface-dark border-border-dark text-foreground">
              <DialogHeader>
                <DialogTitle>Úprava skladu: {adjustItem?.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdjust} className="space-y-4 mt-2">
                <div className="flex bg-surface-card rounded-md p-1 border border-border-dark">
                  <button 
                    type="button" 
                    onClick={() => setAdjustMode("add")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded ${adjustMode==="add" ? "bg-green-500/20 text-green-400" : "text-gray-400 hover:text-white"}`}
                  >Pridať</button>
                  <button 
                    type="button" 
                    onClick={() => setAdjustMode("remove")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded ${adjustMode==="remove" ? "bg-red-500/20 text-red-400" : "text-gray-400 hover:text-white"}`}
                  >Odobrať</button>
                </div>
                
                <div>
                  <Label>Množstvo ({adjustItem?.unit})</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    value={adjustAmount} 
                    onChange={e => setAdjustAmount(e.target.value)} 
                    className="mt-1 bg-surface-card border-border-dark text-white" 
                  />
                  <p className="mt-2 text-xs text-zinc-500">Aktuálny stav: {adjustItem?.qty_available} {adjustItem?.unit}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" className="border-border-dark text-white" onClick={() => { setAdjustItem(null); setAdjustAmount(""); }}>Zrušiť</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold" disabled={adjustMutation.isPending}>
                    {adjustMutation.isPending ? "Ukladám..." : "Potvrdiť"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
            <DialogContent className="bg-surface-dark border-border-dark text-foreground border-destructive/50">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Vymazať položku?
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-zinc-400">Naozaj chcete vymazať položku <strong className="text-white">{deleteItem?.name}</strong>? Táto akcia je nevratná.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="border-border-dark text-white" onClick={() => setDeleteItem(null)}>Zrušiť</Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? "Mažem..." : "Vymazať"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-steel rounded-xl shadow-glow border-b-2 border-b-primary border-t border-t-gray-500 border-x border-x-gray-600 p-5 relative overflow-hidden group transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Celková Hodnota</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalValue.toLocaleString('sk-SK', {style: 'currency', currency: 'EUR'})}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-xs text-green-400 font-medium flex items-center z-10 relative">
            <TrendingUp className="w-3 h-3 mr-1" /> +2.4% od min. mesiaca
          </p>
        </div>

        {/* Best Seller */}
        <div className="bg-steel rounded-xl shadow-glow border-b-2 border-b-primary border-t border-t-gray-500 border-x border-x-gray-600 p-5 relative overflow-hidden group transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Najpredávanejší</p>
              <h3 className="text-xl font-bold text-white mt-1 truncate max-w-[150px]" title="Mramor Carrara biela">Mramor Carrara</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/10">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-text-secondary z-10 relative">
            <span className="text-white font-medium">124 m²</span> za posledných 30 dní
          </p>
        </div>

        {/* Low Stock */}
        <div className="bg-steel rounded-xl shadow-glow border-b-2 border-b-primary border-t border-t-gray-500 border-x border-x-gray-600 p-5 relative overflow-hidden group transition-all duration-300">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Položky pod limitom</p>
              <h3 className="text-2xl font-bold text-white mt-1">{lowStockCount}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-500 font-medium z-10 relative hover:underline cursor-pointer" onClick={() => setShowLowStock(!showLowStock)}>
            Zobraziť kritické položky →
          </p>
        </div>

        {/* Capacity */}
        <div className="bg-steel rounded-xl shadow-glow border-b-2 border-b-primary border-t border-t-gray-500 border-x border-x-gray-600 p-5 relative overflow-hidden group transition-all duration-300">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Využitie skladu</p>
              <h3 className="text-2xl font-bold text-white mt-1">85%</h3>
            </div>
            <div className="relative h-12 w-12">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeWidth="4"></path>
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-text-secondary z-10 relative">
            Skladová zóna A je plná
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1a1c20] rounded-xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] border border-gray-800 flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-transparent rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Vyhľadaj podľa názvu, SKU alebo kategórie..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full bg-[#1A1A1A] border-border-dark text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors h-9"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border border-primary bg-gradient-to-b from-primary-light to-primary text-white shadow-glow-strong whitespace-nowrap font-bold">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedCategoryId ? categories?.find(c => c.id === selectedCategoryId)?.name || "Kategória" : "Všetky kategórie"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-surface-dark border-border-dark text-white">
                <DropdownMenuItem onClick={() => setSelectedCategoryId("")} className="hover:bg-white/5 cursor-pointer">
                  Všetky kategórie
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border-dark" />
                {categories?.map(c => (
                  <DropdownMenuItem key={c.id} onClick={() => setSelectedCategoryId(c.id)} className="hover:bg-white/5 cursor-pointer">
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="sm" 
              className={showLowStock ? "border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 whitespace-nowrap" : "border-t border-t-gray-500 border-x-gray-600 border-b border-b-black bg-steel text-gray-300 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] whitespace-nowrap"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Iba nízky stav
            </Button>
            <Button variant="outline" size="sm" className="border-t border-t-gray-500 border-x-gray-600 border-b border-b-black bg-steel text-gray-300 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] whitespace-nowrap">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {!items?.length ? (
            <div className="flex justify-center items-center py-24">
              <div className="bg-steel-plate w-80 p-8 pt-10 rounded-xl flex flex-col items-center">
                 {/* Screws */}
                 <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner border border-gray-800 flex items-center justify-center"><div className="w-2 h-[1px] bg-gray-900 rotate-45"></div></div>
                 <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner border border-gray-800 flex items-center justify-center"><div className="w-2 h-[1px] bg-gray-900 -rotate-12"></div></div>
                 <div className="absolute bottom-4 left-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner border border-gray-800 flex items-center justify-center"><div className="w-2 h-[1px] bg-gray-900 rotate-90"></div></div>
                 <div className="absolute bottom-4 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-inner border border-gray-800 flex items-center justify-center"><div className="w-2 h-[1px] bg-gray-900 rotate-12"></div></div>
                 
                 <div className="bg-gradient-to-b from-gray-200 to-gray-400 rounded-2xl p-4 shadow-lg mb-6 border-b-2 border-r-2 border-gray-500 border-t border-l border-white/50">
                    <Package className="w-10 h-10 text-gray-800" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2 drop-shadow-sm tracking-tight">Správa položky</h3>
                 <p className="text-sm text-gray-700 mb-8 text-center font-medium drop-shadow-sm">Pridajte prvú skladovú položku.</p>
                 <Button className="w-full shadow-glow-strong bg-gradient-to-b from-primary-light to-primary hover:from-primary hover:to-primary-hover border border-primary-light text-white font-bold" onClick={() => setOpen(true)}>
                   <Plus className="w-4 h-4 mr-2" /> Pridať položku
                 </Button>
              </div>
            </div>
          ) : (
            <Table className="w-full text-left border-collapse min-w-[800px]">
              <TableHeader className="bg-[#1F1F1F]">
                <TableRow className="border-border-dark hover:bg-transparent text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-6 py-4 w-16">Náhľad</TableHead>
                  <TableHead className="px-6 py-4">Názov / SKU</TableHead>
                  <TableHead className="px-6 py-4">Kategória</TableHead>
                  <TableHead className="px-6 py-4">Množstvo</TableHead>
                  <TableHead className="px-6 py-4 text-right">Cena / ks</TableHead>
                  <TableHead className="px-6 py-4 text-center">Stav</TableHead>
                  <TableHead className="px-6 py-4 text-center w-16">Akcia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border-dark">
                {items.map(item => {
                  const available = item.qty_available - item.qty_reserved;
                  const isLow = available <= item.min_stock;
                  const isCritical = available < item.min_stock * 0.5 && item.min_stock > 0;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="h-10 w-10 rounded-md bg-surface-darker flex items-center justify-center border border-border-dark overflow-hidden group-hover:border-primary/50 transition-colors">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Box className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku || "N/A"}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          {item.category?.name || "Nezaradené"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{available.toFixed(2)} {item.unit}</span>
                          <span className="text-xs text-gray-500">{item.qty_reserved.toFixed(2)} rezerv.</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-medium text-white text-right">
                        {item.sale_price ? `${item.sale_price.toLocaleString('sk-SK', {style: 'currency', currency: 'EUR'})}` : "—"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-red-900/30 text-red-400 border border-red-900/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                            Kritické
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber-900/30 text-amber-500 border border-amber-900/50">
                            Pod Limitom
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-green-900/30 text-green-400 border border-green-900/50">
                            Dostatočné
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zobraziť akcie">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-surface-dark border-border-dark">
                              <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                                <Link href={`/app/stock/${item.id}/edit`} className="flex items-center w-full">
                                  <Edit2 className="w-4 h-4 mr-2 text-primary" />
                                  <span>Upraviť produkt</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAdjustItem(item)} className="hover:bg-white/5 cursor-pointer">
                                <Package className="w-4 h-4 mr-2 text-primary" />
                                <span>Pridať / Odobrať množstvo</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border-dark" />
                              <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Vymazať produkt</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Pagination placeholder (like HTML) */}
        {items && items.length > 0 && (
          <div className="p-4 border-t border-border-dark flex justify-between items-center text-sm text-gray-500 bg-[#1F1F1F] rounded-b-xl">
            <span>Ukážem 1 až {items.length} z {items.length} položiek</span>
            <div className="flex space-x-1">
              <button className="px-3 py-1 bg-surface-darker border border-border-dark rounded hover:bg-white/5 transition-colors cursor-not-allowed opacity-50">Predchádzajúce</button>
              <button className="px-3 py-1 bg-primary text-white border border-primary-hover rounded shadow-lg shadow-primary/20">1</button>
              <button className="px-3 py-1 bg-surface-darker border border-border-dark rounded hover:bg-white/5 transition-colors cursor-not-allowed opacity-50">Ďalšie</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
