"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ManagerDashboard } from "./ManagerDashboard";
import { SalesDashboard } from "./SalesDashboard";

export function DashboardClientView() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || "Užívateľ";
  const role = user?.role || 'sales';
  
  // role 'admin'alebo 'manager' vidí ManagerDashboard
  // ostatní ('sales', 'user') vidia SalesDashboard
  const isManager = role === 'admin' || role === 'manager';

  return (
    <div className="space-y-6">
      {/* Universal Header */}
      <div className="flex justify-between items-center bg-surface-dark p-6 rounded-xl border border-border-dark shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Prehľad dashboardu</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Vitajte späť {firstName}, tu je prehľad toho, čo sa dnes v ArtStone deje.
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-darker text-gray-400 border border-border-dark capitalize">
            Rola: {role}
          </span>
        </div>
      </div>

      {isManager ? <ManagerDashboard /> : <SalesDashboard />}
    </div>
  );
}
