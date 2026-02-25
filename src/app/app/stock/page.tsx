import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StockClientView } from './components/StockClientView';

export default async function StockPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-display font-bold">Sklad</h1>
      <p className="text-muted-foreground">Správa skladových zásob a materiálov.</p>
      <StockClientView />
    </div>
  );
}
