import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const visibleFields = "id::text,merchant_return_id,date_received,status,item_sku,qty,condition,inspection_outcome,inspected_at,client_summary,returnlab_return_photos(id,photo_category)";
const directionFields = ",storage_until,outbound_status,returnlab_client_instructions(instruction,submitted_at)";

export type ClientInstruction = {
  instruction: "warehouse_hold" | "disposal_authorized";
  submitted_at: string;
};

export type PortalQueue = "warehouse_hold" | "disposal_authorized" | "awaiting_decision" | "pending_inspection" | "findings_posted";

export type PortalReturn = {
  id: string;
  merchant_return_id: string;
  date_received: string;
  storage_until?: string | null;
  outbound_status?: string | null;
  status: string;
  item_sku: string | null;
  qty: number;
  condition: string;
  inspection_outcome: string | null;
  inspected_at: string | null;
  client_summary: string | null;
  returnlab_return_photos: { id: number; photo_category: string }[];
  returnlab_client_instructions?: ClientInstruction | ClientInstruction[] | null;
};

export const portalPageSize = 30;
export const portalQueueLabels = {
  warehouse_hold: "Held for warehouse shipment",
  disposal_authorized: "Disposal authorized",
  awaiting_decision: "Awaiting your decision",
  pending_inspection: "Pending inspection",
  findings_posted: "Findings posted",
} satisfies Record<PortalQueue, string>;

export const portalInstructionLabels = {
  warehouse_hold: "Hold for shipment to your U.S. warehouse",
  disposal_authorized: "Authorize disposal",
} satisfies Record<ClientInstruction["instruction"], string>;

export function getPortalQueues(instructionsEnabled: boolean): PortalQueue[] {
  return instructionsEnabled
    ? ["warehouse_hold", "disposal_authorized", "awaiting_decision", "pending_inspection"]
    : ["findings_posted", "pending_inspection"];
}

export function canRequestInstruction(row: PortalReturn, instructionsEnabled: boolean) {
  return instructionsEnabled && !!row.inspected_at &&
    row.status === "On Hold" && row.outbound_status !== "Tendered to carrier" &&
    !getRecordedInstruction(row);
}

export function getRecordedInstruction(row: PortalReturn) {
  const record = row.returnlab_client_instructions;
  return Array.isArray(record) ? record[0] ?? null : record ?? null;
}

export async function getPortalReturnCounts(clientId: string) {
  const { data, error } = await getSupabaseAdmin().rpc("get_returnlab_client_dashboard", {
    p_client_id: clientId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Unable to load client return totals.");
  }
  const counts = data as Record<string, unknown>;
  return Object.fromEntries(Object.keys(portalQueueLabels).map((key) => {
    const value = Number(counts[key] ?? 0);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid client return totals.");
    return [key, value];
  })) as Record<PortalQueue, number>;
}

export async function getPortalReturns(clientId: string, page: number, instructionsEnabled: boolean, returnId?: string, queue?: PortalQueue) {
  const offset = (page - 1) * portalPageSize;
  const query = getSupabaseAdmin().from("returnlab_returns").select<string, PortalReturn>(visibleFields + (instructionsEnabled ? directionFields : ""))
    .eq("client_id", clientId).not("merchant_return_id", "is", null)
    .eq("returnlab_return_photos.client_visible", true);
  if (returnId) query.eq("merchant_return_id", returnId);
  if (queue && queue !== "findings_posted") {
    query.not("status", "in", "(Returned,Disposed)")
      .or('outbound_status.is.null,outbound_status.neq."Tendered to carrier"');
  }
  if (queue === "pending_inspection") query.is("inspected_at", null);
  if (queue === "findings_posted") query.not("inspected_at", "is", null);
  if (queue === "awaiting_decision") {
    query.eq("status", "On Hold").not("inspected_at", "is", null).is("returnlab_client_instructions", null);
  }
  if (queue === "warehouse_hold" || queue === "disposal_authorized") {
    query.not("inspected_at", "is", null)
      .eq("returnlab_client_instructions.instruction", queue)
      .not("returnlab_client_instructions", "is", null);
  }
  const { data, error } = await query.order("date_received", { ascending: false })
    .order("id", { ascending: false }).range(offset, offset + portalPageSize);
  if (error) throw new Error("Unable to load client returns.");
  const rows = (data ?? []) as unknown as PortalReturn[];
  return { rows: rows.slice(0, portalPageSize), hasMore: rows.length > portalPageSize };
}
