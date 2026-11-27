"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActivePortalCompany, normalizePortalEmail, portalAuth, portalCookie } from "@/lib/client-portal-auth";

type State = { email: string; ready: boolean; message: string };

export async function portalSignIn(previous: State, form: FormData): Promise<State> {
  const email = normalizePortalEmail(String(form.get("email") ?? ""));
  if (!email) return { email: "", ready: false, message: "Enter a valid email address." };
  const intent = form.get("intent");
  if (intent === "request") {
    try {
      if (await getActivePortalCompany(email)) {
        const { error } = await portalAuth().signInWithOtp({ email, options: { shouldCreateUser: false } });
        if (error) console.warn("Portal email sign-in request rejected.", error.code ?? "unknown");
      }
    } catch {
      // Keep the public response uniform for unknown and approved accounts.
      console.error("Unable to initiate portal email sign-in.");
    }
    return { email, ready: true, message: "If this address is set up for the portal, check your inbox for a sign-in code." };
  }

  if (intent !== "verify") return previous;
  const invalid = { email, ready: true, message: "That code couldn’t be verified. Try again or request a new one." };
  const code = String(form.get("code") ?? "").trim();
  if (!/^\d{6,10}$/.test(code)) return invalid;
  try {
    if (!(await getActivePortalCompany(email))) return invalid;
    const { data, error } = await portalAuth().verifyOtp({ email, token: code, type: "email" });
    if (error || !data.session || !data.user?.email_confirmed_at ||
        normalizePortalEmail(data.user.email ?? "") !== email ||
        !(await getActivePortalCompany(email, data.user.id))) return invalid;
    (await cookies()).set(portalCookie, data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/portal",
      maxAge: Math.min(3600, data.session.expires_in),
    });
  } catch {
    console.error("Unable to verify portal email sign-in.");
    return invalid;
  }
  redirect("/portal");
}

export async function portalSignOut() {
  (await cookies()).set(portalCookie, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/portal", maxAge: 0,
  });
  redirect("/portal/sign-in");
}
