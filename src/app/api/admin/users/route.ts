import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if current user is admin/správca
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'správca')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'správca')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, full_name, role } = body;

  const adminClient = createAdminClient();

  // 1. Create User in Auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Profile is usually created by trigger, but let's ensure it has the correct role
  // Since we are using service_role, we can update it immediately
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ role, full_name, email })
    .eq('id', authUser.user.id);

  if (profileError) {
    // Cleanup if profile fails? Maybe just log it.
    console.error("Profile update error:", profileError);
  }

  return NextResponse.json({ user: authUser.user });
}

export async function PATCH(req: Request) {
  const supabase = await createServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser?.id)
    .single();

  if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'správca')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, full_name, role } = body;

  const adminClient = createAdminClient();

  // RBAC: Only správca can modify another správca
  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (targetProfile?.role === 'správca' && currentProfile.role !== 'správca') {
    return NextResponse.json({ error: "Iba správca môže meniť údaje iného správcu." }, { status: 403 });
  }

  // Update Auth Metadata if needed
  if (full_name) {
    await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { full_name }
    });
  }

  // Update Profile
  const { error } = await adminClient
    .from('profiles')
    .update({ full_name, role })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const supabase = await createServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser?.id)
    .single();

  if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'správca')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const adminClient = createAdminClient();

  // RBAC: Only správca can delete another správca
  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (targetProfile?.role === 'správca' && currentProfile.role !== 'správca') {
    return NextResponse.json({ error: "Admin nemôže vymazať správcu." }, { status: 403 });
  }

  // Don't let user delete themselves
  if (id === currentUser?.id) {
    return NextResponse.json({ error: "Nemôžete vymazať vlastný účet cez toto rozhranie." }, { status: 400 });
  }

  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

// Password Reset Action (via PUT)
export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser?.id)
    .single();

  if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'správca')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, password } = body;

  const adminClient = createAdminClient();

  // RBAC
  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (targetProfile?.role === 'správca' && currentProfile.role !== 'správca') {
    return NextResponse.json({ error: "Admin nemôže resetovať heslo správcovi." }, { status: 403 });
  }

  const { error } = await adminClient.auth.admin.updateUserById(id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
