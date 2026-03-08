import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slugify";
import { FilialeRole } from "@/types/filiale";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const holdingId = searchParams.get("holding_id");

        let query = supabase
            .from("filiales")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        if (holdingId) {
            if (!UUID_REGEX.test(holdingId)) {
                return NextResponse.json({ error: "Invalid holding_id" }, { status: 400 });
            }
            query = query.eq("holding_id", holdingId);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching filiales:", error);
            return NextResponse.json({ error: "Failed to fetch filiales" }, { status: 500 });
        }

        return NextResponse.json({ data, count });
    } catch (error: unknown) {
        console.error("GET /api/filiales error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { holdingId, name, description, color, logoUrl, dotColor } = body;

        if (!holdingId || !name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const adminAuthClient = createAdminClient();

        // Verify that the user is an admin of the holding
        const { data: membership, error: membershipError } = await adminAuthClient
            .from("holding_members")
            .select("role")
            .eq("holding_id", holdingId)
            .eq("user_id", session.user.id)
            .single();

        if (membershipError || !membership || !["admin", "super_admin"].includes(membership.role)) {
            return new NextResponse("Forbidden - Must be holding admin", { status: 403 });
        }

        const slug = slugify(name) + "-" + Math.random().toString(36).substring(2, 6);

        // Create the filiale
        const { data: filiale, error: createError } = await adminAuthClient
            .from("filiales")
            .insert({ holding_id: holdingId, name, slug, description, color: color || "#6366f1", logo_url: logoUrl || null, dot_color: dotColor || color || "#6366f1" })
            .select()
            .single();

        if (createError) {
            console.error("Error creating filiale:", createError);
            return new NextResponse(createError.message, { status: 500 });
        }

        // Add creator as admin
        const { error: memberError } = await adminAuthClient.from("filiale_members").insert({
            filiale_id: filiale.id,
            user_id: session.user.id,
            role: "admin" as FilialeRole,
        });

        if (memberError) {
            console.error("Error adding filiale member:", memberError);
            // We don't fail the request completely if adding the member fails, 
            // since the filiale was created, but we should log it.
        }

        return NextResponse.json(filiale);
    } catch (error: unknown) {
        console.error("POST /api/filiales error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return new NextResponse(message, { status: 500 });
    }
}
