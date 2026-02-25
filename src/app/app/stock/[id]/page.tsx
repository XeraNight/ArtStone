import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProductDetailClientView } from './components/ProductDetailClientView';

export default async function ProductDetailPage({
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

  return <ProductDetailClientView productId={id} />;
}
