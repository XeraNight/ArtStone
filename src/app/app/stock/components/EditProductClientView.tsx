"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useInventoryItem, useUpdateInventoryItem } from "@/hooks/useInventory";
import { toast } from "sonner";
import { ArrowLeft, Save, UploadCloud, RefreshCw, Layers, Sliders, Tag, Info, Package, Warehouse } from "lucide-react";

export function EditProductClientView({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: categories = [] } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: product, isLoading, isError } = useInventoryItem(productId);
  const updateMutation = useUpdateInventoryItem();

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingFile(true);
      let finalImageUrl = formData.image_url;

      if (newImageFile) {
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

      await updateMutation.mutateAsync({ 
        id: productId, 
        ...formData,
        image_url: finalImageUrl 
      });
      toast.success("Zmeny uložene.");
      router.push('/app/stock');
    } catch (error: any) {
      toast.error(`Chyba: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  if (isLoading) return <div>Načítavam...</div>;

  return (
    <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark p-6">
       <button onClick={() => router.push('/app/stock')} className="flex items-center gap-2 mb-6 text-zinc-500">
           <ArrowLeft className="w-5 h-5" /> Späť
       </button>
       <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold">Upraviť produkt: {product?.name}</h2>
          <div className="space-y-4">
              <label className="block text-sm font-medium">Názov</label>
              <input 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded"
              />
          </div>
          <button type="submit" className="bg-primary px-6 py-2 rounded font-bold text-black">ULOŽIŤ</button>
       </form>
    </div>
  );
}
