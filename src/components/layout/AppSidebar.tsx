"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "./AppLayout";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "admin" | "manager" | "sales" | "accountant" | "warehouse" | "client";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  group: "main" | "system";
}

const navItems: NavItem[] = [
  {
    title: "Prehľad",
    href: "/app/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "sales"],
    group: "main"
  },
  {
    title: "Leady a klienti",
    href: "/app/clients", // Or combine leads/clients if that's the routing
    icon: Users,
    roles: ["admin", "manager", "sales"],
    group: "main"
  },
  {
    title: "Sklad",
    href: "/app/stock",
    icon: Package,
    roles: ["admin", "manager", "sales", "warehouse"],
    group: "main"
  },
  {
    title: "Projekty (Dokumenty)",
    href: "/app/documents",
    icon: FolderOpen,
    roles: ["admin", "manager", "sales", "client"],
    group: "main"
  },
  {
    title: "Nastavenia",
    href: "/app/settings",
    icon: Settings,
    roles: ["admin"],
    group: "system"
  }
];

export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth(); // <--- Get real user and logout function
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavItems = navItems.filter((item) => {
    // If we have a user role, use it immediately
    if (user?.role) {
      const currentRole = String(user.role).toLowerCase();
      if (currentRole === "admin") return true;
      return item.roles.includes(currentRole as UserRole);
    }
    
    // Default during SSR/Loading/Unauthenticated
    // Show "sales" items as a baseline to prevent empty sidebar
    return item.roles.includes("sales");
  });

  const mainItems = filteredNavItems.filter(i => i.group === "main");
  const systemItems = filteredNavItems.filter(i => i.group === "system");

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin": return "Administrátor";
      case "manager": return "Manažér";
      case "sales": return "Obchodník";
      case "warehouse": return "Skladník";
      case "accountant": return "Účtovník";
      default: return "";
    }
  };

  const handleLogout = async () => {
    console.log("Logout triggered");
    await logout();
    router.push('/login');
  };

  // Gracefully handle undefined user
  const userName = mounted && user?.name ? user.name : "Neznámy Používateľ";
  const userInitials = mounted && user?.avatar 
    ? user.avatar 
    : userName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#0A0A0A] border-r border-border-dark transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center space-x-2 px-6 py-6 border-b border-border-dark h-[81px] flex-shrink-0">
        {!collapsed ? (
          <>
            <Layers className="text-primary w-8 h-8 flex-shrink-0" />
            <span className="text-2xl font-bold tracking-tight text-white uppercase">ArtStone</span>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <Layers className="text-primary w-8 h-8" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border-dark bg-surface-dark text-muted-foreground hover:text-white z-50 hidden md:flex"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hlavné</div>}
        {mainItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-all duration-300",
                isActive 
                  ? "bg-steel text-white shadow-glow border-y border-y-gray-600 border-r border-r-gray-600 border-l-2 border-l-primary" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0 py-3 block text-center"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 drop-shadow-sm",
                isActive ? "text-primary filter drop-shadow-[0_0_5px_rgba(255,107,53,0.8)]" : "text-gray-500 group-hover:text-gray-300",
                !collapsed && "mr-3"
              )} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {systemItems.length > 0 && (
          <>
            {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-2">Systém</div>}
            {collapsed && <div className="h-px bg-border-dark w-full my-4" />}
            
            {systemItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-all duration-300",
                    isActive 
                      ? "bg-steel text-white shadow-glow border-y border-y-gray-600 border-r border-r-gray-600 border-l-2 border-l-primary" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white",
                    collapsed && "justify-center px-0 py-3 block text-center"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 drop-shadow-sm",
                    isActive ? "text-primary filter drop-shadow-[0_0_5px_rgba(255,107,53,0.8)]" : "text-gray-500 group-hover:text-gray-300",
                    !collapsed && "mr-3"
                  )} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User profile fixed at bottom */}
      <div className="p-4 border-t border-border-dark bg-[#0F0F0F] flex-shrink-0">
        <div className={cn("flex items-center", collapsed && "justify-center flex-col gap-2")}>
          <Avatar className="h-9 w-9 rounded-full ring-2 ring-border-dark">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{userInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs font-medium text-gray-500 hover:text-primary cursor-pointer transition-colors" onClick={handleLogout}>Odhlásiť sa</div>
            </div>
          )}
          {collapsed && (
            <LogOut className="h-4 w-4 text-gray-500 hover:text-primary cursor-pointer mt-2" onClick={handleLogout}/>
          )}
        </div>
      </div>
    </aside>
  );
}
