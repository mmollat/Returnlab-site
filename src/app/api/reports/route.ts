import { NextRequest, NextResponse } from "next/server";
import { hasValidBasicAuth } from "@/lib/basic-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ReportData, ReportRow, ReturnRecord } from "@/lib/returnlab-types";

const baseFee = Number(process.env.RETURNLAB_BASE_FEE ?? 800);
const includedReturns = Number(process.env.RETURNLAB_INCLUDED_RETURNS ?? 100);
const overageFee = Number(process.env.RETURNLAB_OVERAGE_FEE ?? 0);

function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required." },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="ReturnLab Reports"' },
    }
  );
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function buildReports(returns: ReturnRecord[]): ReportRow[] {
  const grouped = new Map<string, ReturnRecord[]>();

  for (const item of returns) {
    const month = item.date_received.slice(0, 7);
    const key = `${item.client_name}\u0000${month}`;
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  return Array.from(grouped.entries())
    .map(([key, items]) => {
      const [client, month] = key.split("\u0000");
      const kept = items.filter((item) =>
        item.action_taken.toLowerCase().includes("keep")
      ).length;
      const disposed = items.filter((item) =>
        item.action_taken.toLowerCase().includes("dispose")
      ).length;
      const totalReturns = items.length;
      const totalTimeMinutes = items.reduce(
        (total, item) => total + (item.time_spent_minutes ?? 0),
        0
      );
      const estimatedResaleValue = items.reduce(
        (total, item) => total + Number(item.estimated_resale_value ?? 0),
        0
      );
      const additionalReturns = Math.max(0, totalReturns - includedReturns);
      const additionalFees = additionalReturns * overageFee;
      const newestTimestamp = items.reduce(
        (latest, item) => (item.updated_at > latest ? item.updated_at : latest),
        items[0].updated_at
      );
      const oldestTimestamp = items.reduce(
        (earliest, item) =>
          item.created_at < earliest ? item.created_at : earliest,
        items[0].created_at
      );

      const reportData: ReportData = {
        business: "ReturnLab Logistics",
        client,
        month,
        generatedAt: new Date().toISOString(),
        totalRows: totalReturns,
        totalReturns,
        kept,
        disposed,
        keepRate: totalReturns ? round((kept / totalReturns) * 100, 1) : 0,
        disposedRate: totalReturns
          ? round((disposed / totalReturns) * 100, 1)
          : 0,
        totalTimeMinutes,
        avgMinutesPerReturn: totalReturns
          ? round(totalTimeMinutes / totalReturns, 1)
          : 0,
        estimatedResaleValue: round(estimatedResaleValue),
        baseFee,
        includedReturns,
        additionalReturns,
        additionalFees: round(additionalFees),
        totalDue: round(baseFee + additionalFees),
        recentReturns: items.slice(0, 50).map((item) => ({
          dateReceived: item.date_received,
          trackingNumber: item.tracking_number ?? undefined,
          carrier: item.carrier,
          itemSku: item.item_sku ?? undefined,
          qty: item.qty,
          actionTaken: item.action_taken,
          status: item.status,
          notes: item.notes ?? undefined,
        })),
      };

      return {
        id: `${client}-${month}`,
        client_name: client,
        report_month: month,
        report_data: reportData,
        created_at: oldestTimestamp,
        updated_at: newestTimestamp,
      };
    })
    .sort((a, b) => b.report_month.localeCompare(a.report_month));
}

export async function GET(request: NextRequest) {
  if (!hasValidBasicAuth(request)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("returnlab_returns")
      .select("*")
      .order("date_received", { ascending: false })
      .order("id", { ascending: false });

    if (error) throw error;

    return NextResponse.json(buildReports((data ?? []) as ReturnRecord[]), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to load reports:", error);
    return NextResponse.json(
      { error: "Unable to load reports." },
      { status: 500 }
    );
  }
}
