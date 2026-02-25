import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InvoicesClientView } from './components/InvoicesClientView';

export default async function InvoicesPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const role = user.user_metadata?.role || 'sales';
  
  if (role === 'sales') {
    // Only Admin and Manager can access invoices 
    redirect('/app/dashboard');
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Faktúry</h1>
        <p className="text-muted-foreground">Správa prijatých a vydaných faktúr.</p>
        <InvoicesClientView />
    </div>
  );
}
