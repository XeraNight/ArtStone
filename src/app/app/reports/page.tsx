import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReportsClientView } from './components/ReportsClientView';

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // TODO: Add role check here later (e.g., if user role !== 'admin', redirect)

  return <ReportsClientView />;
}
