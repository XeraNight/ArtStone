import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClientsClientView } from './components/ClientsClientView';

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const role = user.user_metadata?.role || 'sales';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Klienti</h1>
        <p className="text-muted-foreground">Správa aktívnych a potenciálnych klientov.</p>
        <ClientsClientView />
    </div>
  );
}
