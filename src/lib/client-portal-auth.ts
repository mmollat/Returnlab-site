import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ActivePortalCompany = {
  id: string;
  name: string;
  client_instructions_enabled: boolean;
};

export const portalCookie = "returnlab-client-session";

export function normalizePortalEmail(value: string) {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function portalAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Client portal authentication is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }).auth;
}

export async function getActivePortalCompany(email: string, verifiedUserId?: string) {
  const db = getSupabaseAdmin();
  let query = db.from("returnlab_client_members")
    .select("client_id").eq("email", email).eq("active", true);
  if (verifiedUserId) query = query.eq("auth_user_id", verifiedUserId);
  const membership = await query.maybeSingle();
  if (membership.error) throw new Error("Client membership lookup failed.");
  if (!membership.data) return null;
  const company = await db.from("returnlab_clients")
    .select("id,name,client_instructions_enabled").eq("id", membership.data.client_id).eq("active", true).eq("portal_enabled", true).maybeSingle();
  if (company.error) throw new Error("Client account lookup failed.");
  return company.data as ActivePortalCompany | null;
}

export async function getPortalIdentity() {
  const token = (await cookies()).get(portalCookie)?.value;
  if (!token) return null;
  const { data, error } = await portalAuth().getUser(token);
  if (error || !data.user?.email_confirmed_at || !data.user.email) return null;
  const email = normalizePortalEmail(data.user.email);
  if (!email) return null;
  const company = await getActivePortalCompany(email, data.user.id);
  return company ? { company, userId: data.user.id } : null;
}

export async function getPortalCompany() {
  return (await getPortalIdentity())?.company ?? null;
}
