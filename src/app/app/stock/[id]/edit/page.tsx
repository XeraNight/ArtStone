import { EditProductClientView } from './components/EditProductClientView';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}
export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditProductClientView productId={id} />;
}
