import { getPortalCompany } from "@/lib/client-portal-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const types = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d{0,17}$/.test(id)) return new Response(null, { status: 404, headers: privateHeaders });
  const company = await getPortalCompany();
  if (!company) return new Response(null, { status: 404, headers: privateHeaders });
  const db = getSupabaseAdmin();
  const { data: photo, error } = await db.from("returnlab_return_photos")
    .select("storage_path,content_type,returnlab_returns!inner(client_id,merchant_return_id,inspected_at)")
    .eq("id", id).eq("returnlab_returns.client_id", company.id)
    .not("returnlab_returns.merchant_return_id", "is", null)
    .not("returnlab_returns.inspected_at", "is", null).maybeSingle();
  if (error || !photo || !types.has(photo.content_type)) return new Response(null, { status: 404, headers: privateHeaders });
  const { data: file } = await db.storage.from("return-inspections").download(photo.storage_path, {}, { cache: "no-store" });
  if (!file) return new Response(null, { status: 404, headers: privateHeaders });
  return new Response(file.stream(), { headers: {
    ...privateHeaders, "Content-Type": photo.content_type, "Content-Disposition": "inline",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}
