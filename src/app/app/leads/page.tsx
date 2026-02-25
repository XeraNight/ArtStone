import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LeadsClientView } from './components/LeadsClientView';

// Format helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default async function LeadsPage() {
  const supabase = await createClient();

  // SECURE SERVER-SIDE AUTH & ROLE FETCHING
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Determine roles 
  const role = user.user_metadata?.role || 'sales';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  // --- SERVER-FIRST DATA FETCHING ---
  // In a real app we fetch initial data here and pass down
  // For now using mock hooks within the Client component for ease of refactor
  
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">Zoznam Leadov</h1>
        <p className="text-muted-foreground">Správa všetkých dopytov a potenciálnych klientov.</p>
        <LeadsClientView />
    </div>
  );
}
