import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
    try {
        // 1. Verify user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Not authenticated", details: authError?.message },
                { status: 401 }
            );
        }

        const admin = createAdminClient();

        // 2. Ensure profile exists
        const { data: profile } = await admin
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile) {
            await admin.from("profiles").insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            });
        }

        // 3. Check if ATG holding already exists
        const { data: existing } = await admin
            .from("holdings")
            .select("*")
            .eq("slug", "atg")
            .maybeSingle();

        if (existing) {
            // Ensure user is a member
            const { data: membership } = await admin
                .from("holding_members")
                .select("id")
                .eq("holding_id", existing.id)
                .eq("user_id", user.id)
                .maybeSingle();

            if (!membership) {
                await admin.from("holding_members").insert({
                    holding_id: existing.id,
                    user_id: user.id,
                    role: "super_admin",
                });
            }

            return NextResponse.json(existing);
        }

        // 4. Create ATG holding
        const { data: holding, error: insertError } = await admin
            .from("holdings")
            .insert({
                name: "ATG",
                slug: "atg",
                description: "Africa Technology Group — Holding",
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message, code: insertError.code },
                { status: 400 }
            );
        }

        // 5. Add user as super_admin
        await admin.from("holding_members").insert({
            holding_id: holding.id,
            user_id: user.id,
            role: "super_admin",
        });

        return NextResponse.json(holding);
    } catch (err: any) {
        console.error("Ensure holding error:", err);
        return NextResponse.json(
            { error: err?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
