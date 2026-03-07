import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Check auth.getUser()
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 2. Check what auth.uid() returns in Postgres
    const { data: uidResult, error: uidError } = await supabase.rpc("auth_uid_check").maybeSingle();

    // 3. Check if profile exists
    let profileExists = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", user.id)
        .maybeSingle();
      profileExists = !!profile;
    }

    // 4. Check if workspaces table has RLS enabled and policies
    const { data: _policies, error: policiesError } = await supabase
      .from("workspaces")
      .select("id")
      .limit(0);

    // 5. Try a simple select count
    const { count, error: countError } = await supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message || null,
      authUidFromPostgres: uidResult,
      authUidError: uidError?.message || null,
      profileExists,
      workspacesAccessible: !policiesError,
      workspacesError: policiesError?.message || null,
      workspacesCount: count,
      countError: countError?.message || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
