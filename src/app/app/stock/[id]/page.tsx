import { ProductDetailClientView } from './components/ProductDetailClientView';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}
export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductDetailClientView productId={id} />;
}
