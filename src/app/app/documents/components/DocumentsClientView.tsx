"use client";

import { useState, useMemo } from "react";
import { useDocuments, useDeleteDocument, useCreateDocument, useUploadDocument } from "@/hooks/useDocuments";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { FileText, Upload, Download, Trash2, Search, File, FileImage, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function getFileIcon(fileType?: string | null) {
  if (!fileType) return <File className="w-5 h-5 text-muted-foreground" />;
  if (fileType.includes("image")) return <FileImage className="w-5 h-5 text-blue-400" />;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
  return <FileText className="w-5 h-5 text-orange-400" />;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DocumentsClientView() {
  const { user } = useAuth();
  
  // State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Dialog states
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  // Queries
  const { data: documents, isLoading, refetch: loadDocuments } = useDocuments();
  const deleteDocument = useDeleteDocument();
  const createDocument = useCreateDocument();
  const uploadDocument = useUploadDocument();

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.filter((doc) => {
      const matchesSearch = debouncedSearch
        ? doc.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;
        
      const matchesCategory =
        categoryFilter === "all" || (doc as any).category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [documents, debouncedSearch, categoryFilter]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadResult = await uploadDocument.mutateAsync(file);
      await createDocument.mutateAsync({
        title: file.name,
        category: 'internal',
        file_url: uploadResult.url,
        file_type: file.type,
        file_size: file.size.toString(),
      });
      toast.success("Dokument bol nahratý");
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Chyba pri nahrávaní súboru");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDownload(fileUrl: string, name: string) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Chyba pri sťahovaní");
    }
  }

  async function handleDeleteConfirm() {
    if (!documentToDelete) return;
    try {
      await deleteDocument.mutateAsync(documentToDelete.id);
      toast.success("Dokument bol zmazaný");
      setDocumentToDelete(null);
    } catch {
      toast.error("Chyba pri mazaní dokumentu");
    }
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#030303]">
      <main className="p-6 sm:p-10 max-w-[1920px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              Dokumenty
            </h2>
            <p className="text-sm text-zinc-500 font-medium">Správa ponúk, faktúr a interných dokumentov</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-zinc-500 text-lg transition-colors group-focus-within:text-primary">search</span>
              <input 
                className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-lg" 
                placeholder="Hľadať v dokumentoch..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800 uppercase tracking-wider text-xs rounded-lg shadow-xl">
                    <Plus className="h-4 w-4" />
                    <span>Vytvoriť</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                  <DropdownMenuItem onClick={() => setCreateQuoteOpen(true)} className="flex items-center gap-2 py-3 cursor-pointer hover:bg-zinc-800">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs uppercase tracking-widest">Cenová ponuka</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreateInvoiceOpen(true)} className="flex items-center gap-2 py-3 cursor-pointer hover:bg-zinc-800">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-xs uppercase tracking-widest">Faktúra</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <label>
                <div className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,102,0,0.15)] uppercase tracking-wider text-xs rounded-lg cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? "Nahrávanie..." : "Nahrať"}</span>
                </div>
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
              </label>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-fade-in">
          {!documents?.length ? (
            <div className="col-span-full p-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
               <div className="flex flex-col items-center gap-4">
                   <div className="h-20 w-20 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-zinc-700">
                      <FileText className="h-10 w-10" />
                   </div>
                   <h3 className="text-white font-bold text-lg">Žiadne dokumenty</h3>
                   <p className="text-zinc-600 font-medium max-w-xs mx-auto">V tejto sekcii zatiaľ nemáte žiadne dokumenty. Nahrajte súbor alebo vytvorte ponuku.</p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-primary/50 transition-all shadow-soft hover:shadow-2xl">
                   <div className="flex items-start justify-between mb-6">
                      <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary transition-all">
                         {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleDownload(doc.file_url, doc.title)}
                           className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:text-primary transition-colors border border-zinc-800"
                           title="Stiahnuť"
                         >
                           <Download className="h-4 w-4" />
                         </button>
                         <button 
                           onClick={() => setDocumentToDelete({ id: doc.id, title: doc.title })}
                           className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:text-red-500 transition-colors border border-zinc-800"
                           title="Vymazať"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                   </div>
                   
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">{doc.title}</h3>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800/50 mt-2">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{formatBytes(doc.file_size ? Number(doc.file_size) : null)}</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString("sk-SK")}</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateQuoteDialog open={createQuoteOpen} onOpenChange={setCreateQuoteOpen} />
      <CreateInvoiceDialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen} />

      {/* Basic confirmation for delete */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl scale-in-center">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
               <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vymazať dokument?</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium">Naozaj chcete vymazať dokument <span className="text-white">"{documentToDelete.title}"</span>? Táto akcia je nevratná.</p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setDocumentToDelete(null)}
              >
                Zrušiť
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                onClick={handleDeleteConfirm}
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
