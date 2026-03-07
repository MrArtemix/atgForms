import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Require authentication for listing forms
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id");

  // RLS will filter to only forms the user has access to
  let query = supabase
    .from("forms")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (workspaceId) {
    if (!UUID_REGEX.test(workspaceId)) {
      return NextResponse.json({ error: "Invalid workspace_id" }, { status: 400 });
    }
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspace_id, title } = body;

  if (!workspace_id || typeof workspace_id !== "string") {
    return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
  }

  if (!UUID_REGEX.test(workspace_id)) {
    return NextResponse.json({ error: "Invalid workspace_id" }, { status: 400 });
  }

  // Verify user is a member of the workspace before creating
  const { data: membership, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace_id)
    .eq("user_id", user.id)
    .single();

  if (memberError || !membership) {
    return NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
  }

  if (membership.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create forms" }, { status: 403 });
  }

  // Sanitize title
  const sanitizedTitle = (title || "Untitled Form").toString().slice(0, 200);

  // Create form with crypto-safe slug
  const slugBase = sanitizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slugSuffix = crypto.randomUUID().slice(0, 8);

  const { data: form, error } = await supabase
    .from("forms")
    .insert({
      workspace_id,
      created_by: user.id,
      title: sanitizedTitle,
      slug: `${slugBase}-${slugSuffix}`,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }

  // Create default page
  await supabase.from("form_pages").insert({
    form_id: form.id,
    title: "Page 1",
    sort_order: 0,
  });

  return NextResponse.json(form, { status: 201 });
}
