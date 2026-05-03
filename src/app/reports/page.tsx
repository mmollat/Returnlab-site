"use client";

import { useEffect, useState } from "react";

type Report = {
  client_name: string;
  report_month: string;
  report_data: any;
};

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(
        "https://vtrilxvdqnvnbzgpokpr.supabase.co/rest/v1/returnlab_reports?select=*&order=created_at.desc&limit=1",
        {
          headers: {
            apikey:
              "sb_publishable_0bY7s0G4JPIxcVBXB2V0pA_7lDgnDR1",
          },
        }
      );

      const data = await res.json();
      setReport(data[0]);
    };

    fetchReport();
  }, []);

  if (!report) {
    return (
      <div className="p-10 text-white">
        Loading report...
      </div>
    );
  }

  const d = report.report_data;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold">
          ReturnLab Logistics
        </h1>
        <p className="text-gray-400">
          {report.client_name} — {report.report_month}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Returns" value={d.totalReturns} />
        <Card title="Kept" value={d.kept} />
        <Card title="Disposed" value={d.disposed} />
        <Card title="Keep Rate" value={`${d.keepRate}%`} />
        <Card title="Total Time" value={`${d.totalTimeMinutes} min`} />
        <Card title="Avg Time" value={`${d.avgMinutesPerReturn} min`} />
        <Card title="Resale Value" value={`$${d.estimatedResaleValue}`} />
        <Card title="Invoice Total" value={`$${d.totalDue}`} />
      </div>

      {/* Simple Bar Visualization */}
      <div className="mb-10">
        <h2 className="text-lg mb-4 text-gray-300">
          Keep vs Dispose
        </h2>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <div className="h-4 bg-zinc-700 rounded overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${d.keepRate}%`,
              }}
            />
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {d.keepRate}% kept / {d.disposedRate}% disposed
          </div>
        </div>
      </div>

      {/* Recent Returns */}
      <div>
        <h2 className="text-lg mb-4 text-gray-300">
          Recent Returns
        </h2>

        <div className="space-y-3">
          {d.recentReturns.map((r: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-900 p-4 rounded-xl flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {r.notes || "Item"}
                </p>
                <p className="text-sm text-gray-400">
                  {r.carrier} • {r.dateReceived}
                </p>
              </div>

              <div
                className={`text-sm font-medium ${
                  r.status === "Received"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {r.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <p className="text-sm text-gray-400">
        {title}
      </p>
      <p className="text-xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}
