"use client";

import dynamic from 'next/dynamic';

const QuotesClientView = dynamic(
  () => import('./components/QuotesClientView').then((mod) => mod.QuotesClientView),
  { ssr: false }
);

export default function QuotesPage() {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold">Cenové ponuky</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono">Správa dopytov a ponúk</p>
      </div>
      <QuotesClientView />
    </div>
  );
}
