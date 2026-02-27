"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Loader2, X } from "lucide-react";
import { useSalespeople } from "@/hooks/useSalespeople";
import { cn } from "@/lib/utils";

interface AssignSalespersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (salespersonId: string | null) => void;
  currentSalespersonId?: string | null;
  title?: string;
}

export function AssignSalespersonDialog({
  open,
  onOpenChange,
  onAssign,
  currentSalespersonId,
  title = "Priradiť obchodníka"
}: AssignSalespersonDialogProps) {
  const { data: salespeople = [], isLoading } = useSalespeople();
  const [search, setSearch] = useState("");

  const filteredSalespeople = salespeople.filter(person => 
    person.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    person.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-zinc-800 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-white uppercase tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Hľadať obchodníka..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 text-white focus:ring-primary focus:border-primary rounded-xl"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-xs text-zinc-500 font-medium">Načítavam obchodníkov...</p>
              </div>
            ) : filteredSalespeople.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-zinc-500">Nenašli sa žiadni obchodníci</p>
              </div>
            ) : (
              <>
                {/* Option to unassign */}
                <button
                  onClick={() => {
                    onAssign(null);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all group",
                    !currentSalespersonId 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      <X className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold uppercase tracking-tight">Zrušiť priradenie</p>
                      <p className="text-[10px] text-zinc-600 font-medium">Bez obchodníka</p>
                    </div>
                  </div>
                </button>

                {filteredSalespeople.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => {
                      onAssign(person.id);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all group",
                      currentSalespersonId === person.id
                        ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(255,102,0,0.05)]"
                        : "bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-primary font-bold transition-all group-hover:scale-105">
                        {person.full_name?.[0] || <User className="h-5 w-5" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{person.full_name}</p>
                        <p className="text-[10px] text-zinc-600 font-medium truncate max-w-[180px]">{person.email}</p>
                      </div>
                    </div>
                    {currentSalespersonId === person.id && (
                      <div className="h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-zinc-950/50 border-t border-zinc-900 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
          >
            Zatvoriť
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
