import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResponseAnswer } from "@/types/response";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("form_id");

    if (!formId) {
      return NextResponse.json({ error: "form_id is required" }, { status: 400 });
    }

    if (!UUID_REGEX.test(formId)) {
      return NextResponse.json({ error: "Invalid form_id" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "0", 10);
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "20", 10), 100);
    const search = searchParams.get("search");

    let query = supabase
      .from("form_responses")
      .select("*", { count: "exact" })
      .eq("form_id", formId)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      query = query.or(`respondent_email.ilike.%${search}%,respondent_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching responses:", error);
      return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error: unknown) {
    console.error("GET /api/responses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, fields, answers } = body;

    // Input validation
    if (!formId || !fields || !answers) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (typeof formId !== "string" || !UUID_REGEX.test(formId)) {
      return new NextResponse("Invalid form ID", { status: 400 });
    }

    if (!Array.isArray(fields) || typeof answers !== "object") {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Use server client (respects RLS) to verify form exists and is published
    const supabase = await createClient();

    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, status")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return new NextResponse("Form not found", { status: 404 });
    }

    // Only allow submissions to published forms (or authenticated users for previews)
    if (form.status !== "published") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new NextResponse("Form is not accepting responses", { status: 403 });
      }
    }

    // Use admin client only for the insert operations (RLS allows anon inserts
    // on published forms, but admin is needed for the response_count trigger)
    const adminClient = createAdminClient();

    // Insert the response
    const { data: response, error: responseError } = await adminClient
      .from("form_responses")
      .insert({
        form_id: formId,
        is_complete: true,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (responseError) {
      console.error("Error creating form response:", responseError);
      return new NextResponse("Failed to create response", { status: 500 });
    }

    // Build answer records with type validation
    const answerRecords: Partial<ResponseAnswer>[] = [];

    for (const field of fields) {
      if (!field.id || typeof field.id !== "string") continue;

      const value = answers[field.id];
      if (value === null || value === undefined) continue;

      const record: Partial<ResponseAnswer> = {
        response_id: response.id,
        field_id: field.id,
      };

      if (typeof value === "string") {
        record.value_text = value.slice(0, 50000); // Prevent oversized text
      } else if (typeof value === "number" && isFinite(value)) {
        record.value_number = value;
      } else if (typeof value === "boolean") {
        record.value_boolean = value;
      } else if (Array.isArray(value) || typeof value === "object") {
        record.value_json = value;
      }

      answerRecords.push(record);
    }

    if (answerRecords.length > 0) {
      const { error: answersError } = await adminClient
        .from("response_answers")
        .insert(answerRecords as ResponseAnswer[]);

      if (answersError) {
        console.error("Error inserting answers:", answersError);
        return new NextResponse("Failed to save answers", { status: 500 });
      }
    }

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error: unknown) {
    console.error("POST /api/responses error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
