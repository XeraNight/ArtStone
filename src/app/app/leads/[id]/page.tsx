import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LeadDetailClientView } from './components/LeadDetailClientView';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Next.js 15: params are a Promise
  const resolvedParams = await params;

  return (
    <LeadDetailClientView leadId={resolvedParams.id} />
  );
}
