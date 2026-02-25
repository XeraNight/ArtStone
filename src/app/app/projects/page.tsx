import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectsClientView } from './components/ProjectsClientView';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return <ProjectsClientView />;
}
