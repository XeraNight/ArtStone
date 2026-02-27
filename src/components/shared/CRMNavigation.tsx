"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { List, Users as UsersIcon } from "lucide-react";

export function CRMNavigation() {
  const pathname = usePathname();
  
  const tabs = [
    {
      name: "Leady",
      href: "/app/leads",
      icon: List
    },
    {
      name: "Klienti",
      href: "/app/clients",
      icon: UsersIcon
    }
  ];

  return (
    <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-20 px-6">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <nav aria-label="Tabs" className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
