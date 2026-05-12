import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  await supabase
    .from("heartbeat")
    .update({
      last_seen: new Date().toISOString(),
    })
    .eq("id", 1);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}
