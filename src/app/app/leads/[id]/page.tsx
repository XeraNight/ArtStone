import { LeadDetailClientView } from './components/LeadDetailClientView';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <LeadDetailClientView leadId={id} />;
}
