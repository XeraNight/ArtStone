import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuotesClientView } from './components/QuotesClientView';

export default async function QuotesPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Cenové ponuky</h1>
        <p className="text-muted-foreground">Správa a tvorba cenových ponúk pre klientov.</p>
        <QuotesClientView />
    </div>
  );
}
