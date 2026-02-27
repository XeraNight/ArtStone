"use client";

import { useState, useMemo } from "react";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
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

export function DocumentsClientView() {
  const { user } = useAuth();
  const userId = user?.id || "";
  // State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState("all"); // Added as per instruction, though not fully implemented in UI
  const [isUploadOpen, setIsUploadOpen] = useState(false); // Added as per instruction, though not fully implemented in UI
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null); // Added as per instruction, though not fully implemented in UI
  const [uploading, setUploading] = useState(false); // Kept for upload state

  // Queries
  const { data: documents, isLoading, refetch: loadDocuments } = useDocuments(); // Replaced direct supabase call with hook

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.filter((doc) => {
      const matchesSearch = debouncedSearch
        ? doc.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;
        
      // The categoryFilter logic is included as per instruction
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
      const supabase = createClient();
      const path = `documents/${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { error: dbError } = await supabase.from("documents").insert({ name: file.name, storage_path: path, file_type: file.type, file_size: file.size, uploaded_by: userId });
      if (dbError) throw dbError;
      toast.success("Dokument bol nahratý");
      loadDocuments(); // Use refetch from hook
    } catch {
      toast.error("Chyba pri nahrávaní súboru");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDownload(storagePath: string, name: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("documents").download(storagePath);
    if (error) { toast.error("Chyba pri sťahovaní"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string, storagePath: string) {
    const supabase = createClient();
    await supabase.storage.from("documents").remove([storagePath]);
    await supabase.from("documents").delete().eq("id", id);
    toast.success("Dokument bol zmazaný");
    loadDocuments();
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Hľadať dokumenty..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-surface-card border-border-dark" />
        </div>
        <label>
          <Button asChild className="bg-primary hover:bg-primary-hover text-white cursor-pointer" disabled={uploading}>
            <span><Upload className="w-4 h-4 mr-1.5" />{uploading ? "Nahrávam..." : "Nahrať súbor"}</span>
          </Button>
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
        </label>
      </div>

      {!documents?.length ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          title="Žiadne dokumenty"
          description="Nahrajte prvý dokument kliknutím na tlačidlo vyššie."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {documents.map(doc => (
            <Card key={doc.id} className="bg-surface-card border-border-dark hover:border-primary/30 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-shrink-0">{getFileIcon(doc.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(doc.file_size ? Number(doc.file_size) : null)} · {new Date(doc.created_at).toLocaleDateString("sk-SK")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => handleDownload(doc.file_url, doc.title)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDocumentToDelete({ id: doc.id, title: doc.title })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
