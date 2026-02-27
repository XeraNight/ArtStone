"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type UserRole = "správca" | "admin" | "manager" | "sales" | "accountant" | "warehouse" | "client";

interface RoleBadgeProps {
  role: string | null | undefined;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = useMemo(() => {
    const r = (role || "").toLowerCase();
    
    switch (r) {
      case "správca":
        return {
          label: "Správca",
          classes: "bg-red-500/10 text-red-500 border-red-500/20"
        };
      case "admin":
        return {
          label: "Admin",
          classes: "bg-primary/10 text-primary border-primary/20"
        };
      case "manažér":
      case "manager":
        return {
          label: "Manažér",
          classes: "bg-blue-500/10 text-blue-400 border-blue-500/20"
        };
      case "obchodník":
      case "sales":
        return {
          label: "Obchodník",
          classes: "bg-green-500/10 text-green-500 border-green-500/20"
        };
      case "warehouse":
        return {
          label: "Sklad",
          classes: "bg-zinc-800 text-zinc-400 border-zinc-700"
        };
      default:
        return {
          label: role || "Používateľ",
          classes: "bg-zinc-800 text-zinc-400 border-zinc-700"
        };
    }
  }, [role]);

  if (!mounted || !role) return null;

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider",
      config.classes,
      className
    )}>
      {config.label}
    </span>
  );
}
