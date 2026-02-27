import { EditProductClientView } from "../../components/EditProductClientView";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductClientView productId={id} />;
}
