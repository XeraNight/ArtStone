import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DocumentsClientView } from './components/DocumentsClientView';

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-display font-bold">Dokumenty</h1>
      <p className="text-muted-foreground">Správa firemných dokumentov a súborov.</p>
      <DocumentsClientView userId={user.id} />
    </div>
  );
}
