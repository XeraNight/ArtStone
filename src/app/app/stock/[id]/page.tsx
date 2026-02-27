import { ProductDetailClientView } from "../components/ProductDetailClientView";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClientView productId={id} />;
}
