"use client";

import dynamic from 'next/dynamic';

const ReportsClientView = dynamic(
  () => import('./components/ReportsClientView').then((mod) => mod.ReportsClientView),
  { ssr: false }
);

export default function ReportsPage() {
  return <ReportsClientView />;
}
