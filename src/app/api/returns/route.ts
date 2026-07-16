import { NextRequest, NextResponse } from "next/server";
import { hasValidBasicAuth } from "@/lib/basic-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ReturnInput } from "@/lib/returnlab-types";

const allowedCarriers = new Set(["UPS", "FedEx", "USPS", "DHL", "Other"]);
const allowedConditions = new Set([
  "New",
  "New (unopened)",
  "Like New",
  "Used",
  "Damaged",
  "Defective",
  "Unknown",
]);
const allowedActions = new Set([
  "Keep (resale)",
  "Dispose",
  "Return to Client",
  "Return to client",
  "Hold for review",
]);
const allowedStatuses = new Set([
  "Received",
  "Processing",
  "Completed",
  "On Hold",
  "Disposed",
  "Returned",
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

function optionalText(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function optionalNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: NextRequest) {
  if (!hasValidBasicAuth(request)) return unauthorized();

  let input: ReturnInput;

  try {
    input = (await request.json()) as ReturnInput;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    !input.clientName?.trim() ||
    !isIsoDate(input.dateReceived) ||
    !allowedCarriers.has(input.carrier) ||
    !allowedConditions.has(input.condition) ||
    !allowedActions.has(input.actionTaken) ||
    !allowedStatuses.has(input.status)
  ) {
    return NextResponse.json(
      { ok: false, error: "One or more required fields are invalid." },
      { status: 400 }
    );
  }

  const qty = Number(input.qty);
  const timeSpentMinutes = optionalNumber(input.timeSpent);
  const estimatedResaleValue = optionalNumber(input.estimatedResaleValue);

  if (
    !Number.isInteger(qty) ||
    qty < 1 ||
    (timeSpentMinutes !== null && timeSpentMinutes < 0) ||
    (estimatedResaleValue !== null && estimatedResaleValue < 0) ||
    (input.storageUntil && !isIsoDate(input.storageUntil))
  ) {
    return NextResponse.json(
      { ok: false, error: "Quantity, dates, or numeric values are invalid." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("returnlab_returns")
      .insert({
        client_name: input.clientName.trim(),
        date_received: input.dateReceived,
        tracking_number: optionalText(input.trackingNumber),
        carrier: input.carrier,
        item_sku: optionalText(input.itemSku),
        qty,
        condition: input.condition,
        return_reason: optionalText(input.returnReason),
        action_taken: input.actionTaken,
        status: input.status,
        time_spent_minutes: timeSpentMinutes,
        estimated_resale_value: estimatedResaleValue,
        storage_until: optionalText(input.storageUntil),
        photo_link: optionalText(input.photoLink),
        notes: optionalText(input.notes),
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("Unable to save return:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save the return." },
      { status: 500 }
    );
  }
}
