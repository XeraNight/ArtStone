"use client";

import dynamic from 'next/dynamic';

const ClientsClientView = dynamic(
  () => import('./components/ClientsClientView').then((mod) => mod.ClientsClientView),
  { ssr: false }
);

export default function ClientsPage() {
  return (
    <div className="animate-fade-in">
        <ClientsClientView />
    </div>
  );
}
