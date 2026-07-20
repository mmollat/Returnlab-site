import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasValidBasicAuth } from "@/lib/basic-auth";
import { isPhotoCategory } from "@/lib/client-workflows";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "return-inspections";
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Authentication required." },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="ReturnLab Reports"' },
    }
  );
}

function extensionFor(contentType: string) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  }[contentType];
}

export async function POST(request: NextRequest) {
  if (!hasValidBasicAuth(request)) return unauthorized();

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid photo upload." },
      { status: 400 }
    );
  }

  const returnId = Number(formData.get("returnId"));
  const category = String(formData.get("category") ?? "");
  const file = formData.get("file");

  if (
    !Number.isInteger(returnId) ||
    returnId < 1 ||
    !isPhotoCategory(category) ||
    !(file instanceof File) ||
    file.size < 1 ||
    file.size > MAX_FILE_SIZE ||
    !ALLOWED_TYPES.has(file.type)
  ) {
    return NextResponse.json(
      { ok: false, error: "Photo type, size, category, or return ID is invalid." },
      { status: 400 }
    );
  }

  const extension = extensionFor(file.type);
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Unsupported photo format." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: returnRecord, error: returnError } = await supabase
    .from("returnlab_returns")
    .select("id, client_name")
    .eq("id", returnId)
    .maybeSingle();

  if (returnError) {
    console.error("Unable to verify photo return:", returnError);
    return NextResponse.json(
      { ok: false, error: "Unable to verify the return." },
      { status: 500 }
    );
  }

  if (!returnRecord) {
    return NextResponse.json(
      { ok: false, error: "Return not found." },
      { status: 404 }
    );
  }

  const { count, error: countError } = await supabase
    .from("returnlab_return_photos")
    .select("id", { count: "exact", head: true })
    .eq("return_id", returnId);

  if (countError) {
    console.error("Unable to count return photos:", countError);
    return NextResponse.json(
      { ok: false, error: "Unable to verify photo limits." },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= 12) {
    return NextResponse.json(
      { ok: false, error: "This return already has the maximum of 12 photos." },
      { status: 409 }
    );
  }

  const clientFolder = returnRecord.client_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const storagePath = `${clientFolder}/${returnId}/${randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Unable to upload return photo:", uploadError);
    return NextResponse.json(
      { ok: false, error: "Unable to upload the photo." },
      { status: 500 }
    );
  }

  const { data: photo, error: insertError } = await supabase
    .from("returnlab_return_photos")
    .insert({
      return_id: returnId,
      storage_path: storagePath,
      photo_category: category,
      original_filename: file.name || null,
      content_type: file.type,
      size_bytes: file.size,
    })
    .select("id, photo_category")
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    console.error("Unable to save return photo metadata:", insertError);
    return NextResponse.json(
      { ok: false, error: "Unable to save the photo record." },
      { status: 500 }
    );
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  return NextResponse.json(
    {
      ok: true,
      photo: {
        id: photo.id,
        category: photo.photo_category,
        url: signed?.signedUrl ?? null,
      },
    },
    { status: 201 }
  );
}
