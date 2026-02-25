import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClientView } from './components/DashboardClientView';

export default async function DashboardPage() {
  const supabase = await createClient();

  // SECURE SERVER-SIDE AUTH & ROLE FETCHING
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Determine roles 
  const role = user.user_metadata?.role || 'sales';
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Užívateľ';

  return <DashboardClientView firstName={firstName} role={role} />;
}
