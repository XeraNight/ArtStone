"use client";

import dynamic from 'next/dynamic';

const LeadsClientView = dynamic(
  () => import('./components/LeadsClientView').then((mod) => mod.LeadsClientView),
  { ssr: false }
);

export default function LeadsPage() {
  return (
    <div className="animate-fade-in">
        <LeadsClientView />
    </div>
  );
}
