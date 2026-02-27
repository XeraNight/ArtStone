"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";

export function LeadDetailClientView({ leadId }: { leadId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Načítavam...</div>;

  return (
    <div className="p-8">
      <button onClick={() => router.push('/app/leads')} className="flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" /> Späť na zoznam
      </button>
      <h2 className="text-3xl font-bold mb-4">{lead?.contact_name}</h2>
      <div className="grid grid-cols-2 gap-8 bg-zinc-900 p-6 rounded-xl">
          <div className="space-y-4">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {lead?.email || 'N/A'}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {lead?.phone || 'N/A'}</div>
          </div>
      </div>
    </div>
  );
}
