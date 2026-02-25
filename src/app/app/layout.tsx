import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Failsafe in case middleware hasn't redirected
    redirect("/login");
  }

  return (
    <AppLayout title="Dashboard">
      {children}
    </AppLayout>
  );
}
