import { LeadDetailClientView } from "../components/LeadDetailClientView";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailClientView leadId={id} />;
}
