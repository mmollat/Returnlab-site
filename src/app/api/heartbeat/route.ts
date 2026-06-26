import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase environment variables are not configured.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase
    .from("heartbeat")
    .update({
      last_seen: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}
