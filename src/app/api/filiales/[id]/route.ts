import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid filiale ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: filiale, error } = await supabase
      .from("filiales")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !filiale) {
      return NextResponse.json({ error: "Filiale not found" }, { status: 404 });
    }

    return NextResponse.json(filiale);
  } catch (error: unknown) {
    console.error("GET /api/filiales/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid filiale ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verify membership: admin or manager
    const { data: membership, error: memberError } = await adminClient
      .from("filiale_members")
      .select("role")
      .eq("filiale_id", id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership || !["admin", "manager"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden - Must be filiale admin or manager" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ["name", "description", "color", "logo_url"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data: filiale, error } = await adminClient
      .from("filiales")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating filiale:", error);
      return NextResponse.json({ error: "Failed to update filiale" }, { status: 500 });
    }

    return NextResponse.json(filiale);
  } catch (error: unknown) {
    console.error("PUT /api/filiales/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid filiale ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verify membership: admin only
    const { data: membership, error: memberError } = await adminClient
      .from("filiale_members")
      .select("role")
      .eq("filiale_id", id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Must be filiale admin" }, { status: 403 });
    }

    const { error } = await adminClient
      .from("filiales")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting filiale:", error);
      return NextResponse.json({ error: "Failed to delete filiale" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/filiales/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
