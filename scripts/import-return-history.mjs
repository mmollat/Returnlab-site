import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

const spreadsheetId =
  process.env.RETURNLAB_SHEET_ID ?? "12tvYb7Iry09074XyPRGUHBwm2dZS4kYpFgmVwuczJ4E";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.env.RETURNLAB_IMPORT_DRY_RUN === "1";

const response = await fetch(
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Return%20Log`
);

if (!response.ok) {
  throw new Error(`Unable to download Google Sheet: ${response.status}`);
}

const sourceRows = parse(await response.text(), {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});

const cleanText = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text && text.toLowerCase() !== "n/a" ? text : null;
};

const cleanNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(number) ? number : null;
};

const cleanDate = (value) => {
  const text = cleanText(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeCondition = (value) => {
  const condition = cleanText(value) ?? "Unknown";
  return condition;
};

const rows = sourceRows
  .map((row, index) => ({
    source_key: `google-sheet-return-log-${index + 2}`,
    client_name: cleanText(row["Client Name"]) ?? "CTH",
    date_received: cleanDate(row["Date Received"]),
    tracking_number: cleanText(row["Tracking Number"]),
    carrier: cleanText(row.Carrier) ?? "Other",
    item_sku: cleanText(row["Item / SKU"]),
    qty: cleanNumber(row.Qty) ?? 1,
    condition: normalizeCondition(row.Condition),
    return_reason: cleanText(row["Return Reason"]),
    action_taken: cleanText(row["Action Taken"]) ?? "Dispose",
    status: cleanText(row.Status) ?? "Received",
    time_spent_minutes: cleanNumber(row["Time Spent (min)"]),
    estimated_resale_value: cleanNumber(row["Est. Resale Value"]),
    storage_until: cleanDate(row["Storage Until"]),
    photo_link: cleanText(row["Photo Link"]),
    notes: cleanText(row.Notes),
  }))
  .filter((row) => row.date_received);

if (dryRun) {
  console.log(`Validated ${rows.length} historical returns.`);
  console.log(
    JSON.stringify(
      rows.reduce((counts, row) => {
        const month = row.date_received.slice(0, 7);
        counts[month] = (counts[month] ?? 0) + 1;
        return counts;
      }, {}),
      null,
      2
    )
  );
  process.exit(0);
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase
  .from("returnlab_returns")
  .upsert(rows, { onConflict: "source_key" });

if (error) {
  throw error;
}

console.log(`Imported ${rows.length} historical returns.`);
