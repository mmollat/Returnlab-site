"use client";

import { useEffect, useMemo, useState } from "react";

type RecentReturn = {
  dateReceived?: string;
  trackingNumber?: string;
  carrier?: string;
  itemSku?: string;
  qty?: number;
  actionTaken?: string;
  status?: string;
  notes?: string;
};

type ReportData = {
  business?: string;
  client?: string;
  month?: string;
  generatedAt?: string;
  totalRows?: number;
  totalReturns?: number;
  kept?: number;
  disposed?: number;
  keepRate?: number;
  disposedRate?: number;
  totalTimeMinutes?: number;
  avgMinutesPerReturn?: number;
  estimatedResaleValue?: number;
  baseFee?: number;
  includedReturns?: number;
  additionalReturns?: number;
  additionalFees?: number;
  totalDue?: number;
  recentReturns?: RecentReturn[];
};

type ReportRow = {
  id: string;
  client_name: string;
  report_month: string;
  report_data: ReportData;
  created_at: string;
  updated_at: string;
};

const SUPABASE_URL = "https://vtrilxvdqnvnbzgpokpr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0bY7s0G4JPIxcVBXB2V0pA_7lDgnDR1";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selectedClient, setSelectedClient] = useState("CTH");
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/returnlab_reports?select=*&order=report_month.desc`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load reports: ${res.status}`);
        }

        const data = (await res.json()) as ReportRow[];
        setReports(data);

        if (data.length > 0) {
          setSelectedClient(data[0].client_name);
          setSelectedMonth(data[0].report_month);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const clients = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.client_name)));
  }, [reports]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        reports
          .filter((r) => r.client_name === selectedClient)
          .map((r) => r.report_month)
      )
    );
  }, [reports, selectedClient]);

  const report = useMemo(() => {
    return (
      reports.find(
        (r) =>
          r.client_name === selectedClient && r.report_month === selectedMonth
      ) ?? reports[0]
    );
  }, [reports, selectedClient, selectedMonth]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p className="text-zinc-400">Loading report...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-semibold">ReturnLab Reports</h1>
        <p className="mt-4 text-red-400">{error || "No reports found."}</p>
      </main>
    );
  }

  const d = report.report_data;
  const recentReturns = d.recentReturns ?? [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-10 flex flex-col gap-6 border-b border-zinc-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-zinc-500">
              ReturnLab Logistics
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Monthly Return Report
            </h1>
            <p className="mt-2 text-zinc-400">
              {report.client_name} · {report.report_month}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Generated{" "}
              {report.updated_at
                ? new Date(report.updated_at).toLocaleString()
                : d.generatedAt}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedClient}
              onChange={(e) => {
                const nextClient = e.target.value;
                setSelectedClient(nextClient);
                const firstMonth = reports.find(
                  (r) => r.client_name === nextClient
                )?.report_month;
                if (firstMonth) setSelectedMonth(firstMonth);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
            >
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Total Returns" value={d.totalReturns ?? 0} />
          <MetricCard label="Kept" value={d.kept ?? 0} accent="green" />
          <MetricCard label="Disposed" value={d.disposed ?? 0} accent="red" />
          <MetricCard label="Invoice Total" value={`$${d.totalDue ?? 0}`} />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Keep Rate" value={`${d.keepRate ?? 0}%`} />
          <MetricCard
            label="Total Time"
            value={`${d.totalTimeMinutes ?? 0} min`}
          />
          <MetricCard
            label="Avg Time / Return"
            value={`${d.avgMinutesPerReturn ?? 0} min`}
          />
          <MetricCard
            label="Est. Resale Value"
            value={`$${d.estimatedResaleValue ?? 0}`}
          />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Keep vs Dispose</h2>
                <p className="text-sm text-zinc-500">
                  Breakdown for {report.report_month}
                </p>
              </div>
              <p className="text-sm text-zinc-500">
                {(d.totalReturns ?? 0).toLocaleString()} total
              </p>
            </div>

            <div className="mb-5 h-5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${d.keepRate ?? 0}%` }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm text-zinc-400">Kept for resale</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-400">
                  {d.kept ?? 0}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {d.keepRate ?? 0}% of processed returns
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-zinc-400">Disposed</p>
                <p className="mt-1 text-2xl font-semibold text-red-400">
                  {d.disposed ?? 0}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {d.disposedRate ?? 0}% of processed returns
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-semibold">Invoice Summary</h2>
            <div className="mt-5 space-y-4 text-sm">
              <Row label="Base Fee" value={`$${d.baseFee ?? 0}`} />
              <Row
                label="Included Returns"
                value={`${d.includedReturns ?? 0}`}
              />
              <Row
                label="Additional Returns"
                value={`${d.additionalReturns ?? 0}`}
              />
              <Row
                label="Additional Fees"
                value={`$${d.additionalFees ?? 0}`}
              />
              <div className="border-t border-zinc-800 pt-4">
                <Row
                  label="Total Due"
                  value={`$${d.totalDue ?? 0}`}
                  strong
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 p-6">
            <h2 className="text-lg font-semibold">Recent Returns</h2>
            <p className="text-sm text-zinc-500">
              Latest entries included in this report
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Item / SKU</th>
                  <th className="px-6 py-4 font-medium">Carrier</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentReturns.map((item, index) => {
                  const isKeep = item.actionTaken
                    ?.toLowerCase()
                    .includes("keep");

                  return (
                    <tr
                      key={`${item.dateReceived}-${index}`}
                      className="border-b border-zinc-900 last:border-0"
                    >
                      <td className="px-6 py-4 text-zinc-300">
                        {item.dateReceived || "—"}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {item.itemSku || "Return Item"}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {item.carrier || "—"}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {item.qty ?? 1}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isKeep
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {item.actionTaken || item.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "green" | "red";
}) {
  const accentClass =
    accent === "green"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={strong ? "text-xl font-semibold" : "text-zinc-200"}>
        {value}
      </span>
    </div>
  );
}
