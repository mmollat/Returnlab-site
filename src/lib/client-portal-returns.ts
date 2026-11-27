import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const visibleFields = "merchant_return_id,date_received,storage_until,status,item_sku,qty,condition,inspection_outcome,inspected_at,client_summary,returnlab_return_photos(id,photo_category)";

export type PortalReturn = {
  merchant_return_id: string;
  date_received: string;
  storage_until: string | null;
  status: string;
  item_sku: string | null;
  qty: number;
  condition: string;
  inspection_outcome: string | null;
  inspected_at: string | null;
  client_summary: string | null;
  returnlab_return_photos: { id: number; photo_category: string }[];
};

export const portalPageSize = 30;

export async function getPortalReturns(clientId: string, page: number, returnId?: string) {
  const offset = (page - 1) * portalPageSize;
  let query = getSupabaseAdmin().from("returnlab_returns").select(visibleFields)
    .eq("client_id", clientId).not("merchant_return_id", "is", null);
  if (returnId) query = query.eq("merchant_return_id", returnId);
  const { data, error } = await query.order("date_received", { ascending: false })
    .order("id", { ascending: false }).range(offset, offset + portalPageSize);
  if (error) throw new Error("Unable to load client returns.");
  const rows = (data ?? []) as PortalReturn[];
  return { rows: rows.slice(0, portalPageSize), hasMore: rows.length > portalPageSize };
}
