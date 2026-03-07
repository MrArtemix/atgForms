import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "ATGForm";
  const description = searchParams.get("description") || "Fill out this form";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "60px",
            maxWidth: "80%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#6366f1",
              marginBottom: "16px",
            }}
          >
            ATGForm
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#64748b",
              textAlign: "center",
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
