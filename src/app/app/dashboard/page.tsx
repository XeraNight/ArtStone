"use client";

import dynamic from 'next/dynamic';

const DashboardClientView = dynamic(
  () => import('./components/DashboardClientView').then((mod) => mod.DashboardClientView),
  { ssr: false }
);

export default function DashboardPage() {
  return <DashboardClientView />;
}
