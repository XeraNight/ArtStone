"use client";

import dynamic from 'next/dynamic';

const StockClientView = dynamic(
  () => import('./components/StockClientView').then((mod) => mod.StockClientView),
  { ssr: false }
);

export default function StockPage() {
  return <StockClientView />;
}
