import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filialeId = searchParams.get("filiale_id");

    let query = supabase
      .from("workspaces")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filialeId) {
      if (!UUID_REGEX.test(filialeId)) {
        return NextResponse.json({ error: "Invalid filiale_id" }, { status: 400 });
      }
      query = query.eq("filiale_id", filialeId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching workspaces:", error);
      return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error: unknown) {
    console.error("GET /api/workspaces error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
