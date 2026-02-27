"use client";

import dynamic from 'next/dynamic';

const SettingsClientView = dynamic(
  () => import('./components/SettingsClientView').then((mod) => mod.SettingsClientView),
  { ssr: false }
);

export default function SettingsPage() {
  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">Nastavenia systému</h1>
        <p className="text-slate-400 text-sm font-mono uppercase tracking-[0.2em]">Konfigurácia & Správa používateľov</p>
      </div>
      <div className="flex-1 overflow-visible">
        <SettingsClientView />
      </div>
    </div>
  );
}
