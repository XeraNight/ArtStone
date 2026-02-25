import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout title="Dashboard">
      {children}
    </AppLayout>
  );
}
