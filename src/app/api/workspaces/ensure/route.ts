import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slugify";

export async function POST() {
  try {
    // 1. Verify the user is authenticated via the regular server client (cookies)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated", details: authError?.message },
        { status: 401 }
      );
    }

    // 2. Use admin client (service role) to bypass RLS for workspace provisioning
    const admin = createAdminClient();

    // 3. Ensure profile exists (required by FK on workspaces.owner_id)
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // Auto-create profile if the trigger didn't fire
      await admin.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      });
    }

    // 4. Check if user already has a workspace
    const { data: existing } = await admin
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Also ensure membership exists
      const { data: membership } = await admin
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", existing.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) {
        await admin.from("workspace_members").insert({
          workspace_id: existing.id,
          user_id: user.id,
          role: "owner",
        });
      }

      return NextResponse.json(existing);
    }

    // 5. Create personal workspace
    const slug = slugify("Personal") + "-" + Math.random().toString(36).substring(2, 6);

    const { data: workspace, error: insertError } = await admin
      .from("workspaces")
      .insert({ name: "Personal", slug, owner_id: user.id })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message, code: insertError.code },
        { status: 400 }
      );
    }

    // 6. Add owner as member
    await admin.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json(workspace);
  } catch (err: any) {
    console.error("Ensure workspace error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
