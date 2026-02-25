import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProductClientView } from './components/EditProductClientView';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { id } = await params;

  return <EditProductClientView productId={id} />;
}
