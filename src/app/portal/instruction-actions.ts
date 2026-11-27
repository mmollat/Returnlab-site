"use server";

import { revalidatePath } from "next/cache";
import { getPortalIdentity } from "@/lib/client-portal-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type State = { result: "idle" | "error" | "saved"; message: string };
const notSaved = { result: "error", message: "The instruction wasn’t saved. This return may already have an instruction or may no longer be eligible. Refresh the page to check." } as const;

export async function submitClientInstruction(_previous: State, form: FormData): Promise<State> {
  const returnId = form.get("returnId");
  const instruction = form.get("instruction");
  if (typeof returnId !== "string" || !/^[1-9]\d{0,17}$/.test(returnId) ||
      (instruction !== "warehouse_hold" && instruction !== "disposal_authorized") ||
      form.get("confirmation") !== instruction) {
    return { result: "error", message: "Choose an instruction and check the confirmation box before submitting." };
  }

  try {
    const identity = await getPortalIdentity();
    if (!identity?.company.client_instructions_enabled) {
      return { result: "error", message: "Instructions aren’t available for this account. Sign in again or contact ReturnLab." };
    }
    const { data, error } = await getSupabaseAdmin().rpc("submit_returnlab_client_instruction", {
      p_return_id: returnId,
      p_client_id: identity.company.id,
      p_user_id: identity.userId,
      p_instruction: instruction,
    });
    if (error) {
      console.error("Client instruction could not be recorded.", error.code);
      return { result: "error", message: "ReturnLab couldn’t save that instruction. Please try again." };
    }
    if (data !== true) return notSaved;
    revalidatePath("/portal");
    return { result: "saved", message: "Instruction recorded. ReturnLab will review it; no shipment or disposal has been performed." };
  } catch {
    return { result: "error", message: "ReturnLab couldn’t save that instruction. Please sign in and try again." };
  }
}
