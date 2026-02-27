"use client";

import dynamic from 'next/dynamic';

const LeadsClientView = dynamic(
  () => import('./components/LeadsClientView').then((mod) => mod.LeadsClientView),
  { ssr: false }
);

export default function LeadsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Zoznam Leadov</h1>
        <p className="text-muted-foreground">Správa všetkých dopytov a potenciálnych klientov.</p>
        <LeadsClientView />
    </div>
  );
}
