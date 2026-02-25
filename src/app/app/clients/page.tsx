"use client";

import dynamic from 'next/dynamic';

const ClientsClientView = dynamic(
  () => import('./components/ClientsClientView').then((mod) => mod.ClientsClientView),
  { ssr: false }
);

export default function ClientsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Klienti</h1>
        <p className="text-muted-foreground">Správa aktívnych a potenciálnych klientov.</p>
        <ClientsClientView />
    </div>
  );
}
