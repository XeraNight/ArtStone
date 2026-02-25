import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClientView } from './components/SettingsClientView';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Server-side role check (3rd layer: UI guard + middleware already checked)
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)
    .single();

  const roleName = (roleData as { roles: { name: string } | null } | null)?.roles?.name;

  if (roleName !== 'admin') {
    redirect('/app/dashboard');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-display font-bold">Nastavenia</h1>
      <p className="text-muted-foreground">Správa systému, rolí a bezpečnostných nastavení.</p>
      <SettingsClientView userId={user.id} />
    </div>
  );
}
