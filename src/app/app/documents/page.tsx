"use client";

import dynamic from 'next/dynamic';

const DocumentsClientView = dynamic(
  () => import('./components/DocumentsClientView').then((mod) => mod.DocumentsClientView),
  { ssr: false }
);

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold">Dokumenty</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono">Úložisko súborov</p>
      </div>
      <DocumentsClientView />
    </div>
  );
}
