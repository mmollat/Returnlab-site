export const DEFAULT_CHECKLIST = ["Item condition checked", "Original packaging checked", "Accessories checked"];
export const CARRIERS = ["UPS", "FedEx", "USPS", "DHL", "Other"] as const;
export const CONDITIONS = ["New", "New (unopened)", "Like New", "Used", "Damaged", "Defective", "Unknown"] as const;
export const OUTCOMES = ["Approved for resale", "Client review required", "Not approved", "Unable to determine"] as const;

export function field(value: unknown, max: number): string {
  if (typeof value !== "string" || value.trim().length > max) return "";
  return value.trim();
}
export function isUuid(value: string) {
  return /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}
export function isoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(+parsed) && parsed.toISOString().slice(0,10) === value;
}
export function portalEmail(value: unknown): string {
  const email = field(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}
