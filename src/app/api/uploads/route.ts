import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/constants/limits";

const ALLOWED_BUCKETS = ["form-assets", "response-uploads"] as const;
type AllowedBucket = typeof ALLOWED_BUCKETS[number];

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Text
  "text/plain", "text/csv",
];

const MAX_FILE_SIZE: Record<AllowedBucket, number> = {
  "form-assets": LIMITS.file.maxFormAssetSize,
  "response-uploads": LIMITS.file.maxResponseUploadSize,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bucketInput = (formData.get("bucket") as string) || "form-assets";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate bucket
  if (!ALLOWED_BUCKETS.includes(bucketInput as AllowedBucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }
  const bucket = bucketInput as AllowedBucket;

  // Validate file size
  if (file.size > MAX_FILE_SIZE[bucket]) {
    const maxMb = Math.round(MAX_FILE_SIZE[bucket] / (1024 * 1024));
    return NextResponse.json({ error: `File too large. Maximum size is ${maxMb}MB` }, { status: 400 });
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Sanitize file extension
  const nameParts = file.name.split(".");
  const ext = nameParts.length > 1 ? nameParts.pop()!.replace(/[^a-zA-Z0-9]/g, "") : "bin";

  // Always generate safe path — never accept path from client
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

  if (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }

  if (bucket === "form-assets") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return NextResponse.json({ url: data.publicUrl, path: fileName });
  }

  return NextResponse.json({ path: fileName });
}
