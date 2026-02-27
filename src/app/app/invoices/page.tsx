"use client";

import dynamic from 'next/dynamic';

const InvoicesClientView = dynamic(
  () => import('./components/InvoicesClientView').then((mod) => mod.InvoicesClientView),
  { ssr: false }
);

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold">Faktúry</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono">Správa fakturácie</p>
      </div>
      <InvoicesClientView />
    </div>
  );
}
