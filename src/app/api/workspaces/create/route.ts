import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slugify";
import { WorkspaceRole } from "@/types/workspace";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description, filialeId } = body;

        if (!name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const adminAuthClient = createAdminClient();

        // If creating within a filiale, verify the user has sufficient permissions
        // They need to be at least a manager of the filiale or an admin of the holding
        if (filialeId) {
            // First check if they are a direct filiale admin/manager
            const { data: filialeMember } = await adminAuthClient
                .from("filiale_members")
                .select("role")
                .eq("filiale_id", filialeId)
                .eq("user_id", session.user.id)
                .single();

            let hasPermission = false;
            if (filialeMember && ["admin", "manager"].includes(filialeMember.role)) {
                hasPermission = true;
            } else {
                // If not, check if they are a holding admin
                const { data: filiale } = await adminAuthClient
                    .from("filiales")
                    .select("holding_id")
                    .eq("id", filialeId)
                    .single();

                if (filiale) {
                    const { data: holdingMember } = await adminAuthClient
                        .from("holding_members")
                        .select("role")
                        .eq("holding_id", filiale.holding_id)
                        .eq("user_id", session.user.id)
                        .single();

                    if (holdingMember && ["admin", "super_admin"].includes(holdingMember.role)) {
                        hasPermission = true;
                    }
                }
            }

            if (!hasPermission) {
                return new NextResponse("Forbidden - Must be filiale manager or holding admin", { status: 403 });
            }
        }

        const slug = slugify(name) + "-" + Math.random().toString(36).substring(2, 6);

        // Create the workspace (projet)
        const { data: workspace, error: createError } = await adminAuthClient
            .from("workspaces")
            .insert({
                name,
                slug,
                description,
                owner_id: session.user.id,
                filiale_id: filialeId || null
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating workspace:", createError);
            return new NextResponse(createError.message, { status: 500 });
        }

        // Add creator as owner in workspace_members
        const { error: memberError } = await adminAuthClient.from("workspace_members").insert({
            workspace_id: workspace.id,
            user_id: session.user.id,
            role: "owner" as WorkspaceRole,
        });

        if (memberError) {
            console.error("Error adding workspace member:", memberError);
            // Non-fatal, return the workspace anyway
        }

        return NextResponse.json(workspace);
    } catch (error: any) {
        console.error("POST /api/workspaces/create error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
