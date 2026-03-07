import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Webhook endpoint for external integrations
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret using timing-safe comparison
    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!secret || !expectedSecret || !secureCompare(secret, expectedSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, form_id, response_id } = body;

    switch (event) {
      case "response.created": {
        console.log(`New response ${response_id} for form ${form_id}`);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
