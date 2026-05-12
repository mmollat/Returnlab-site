"use client";

import { useState } from "react";

const clients = ["CTH"];
const carriers = ["UPS", "FedEx", "USPS", "DHL", "Other"];
const conditions = [
  "New",
  "Like New",
  "Used",
  "Damaged",
  "Defective",
];
const actions = ["Keep (resale)", "Dispose", "Return to Client"];
const statuses = ["Received", "Processing", "Completed", "On Hold"];

export default function IntakePage() {
  const [form, setForm] = useState({
    clientName: "CTH",
    dateReceived: "",
    trackingNumber: "",
    carrier: "UPS",
    itemSku: "",
    qty: 1,
    condition: "Used",
    returnReason: "",
    actionTaken: "Dispose",
    status: "Received",
    timeSpent: "",
    estimatedResaleValue: "",
    storageUntil: "",
    photoLink: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(
    key: string,
    value: string | number
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    try {
      // REPLACE THIS WITH YOUR N8N WEBHOOK URL
      const webhookUrl = "https://n8n.srv1556990.hstgr.cloud/webhook/returnlab-intake";

      const payload = {
        ...form,
        month: form.dateReceived
          ? form.dateReceived.slice(0, 7)
          : "",
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit intake.");
      }

      setSuccess(true);

      setForm({
        clientName: "CTH",
        dateReceived: "",
        trackingNumber: "",
        carrier: "UPS",
        itemSku: "",
        qty: 1,
        condition: "Used",
        returnReason: "",
        actionTaken: "Dispose",
        status: "Received",
        timeSpent: "",
        estimatedResaleValue: "",
        storageUntil: "",
        photoLink: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit intake.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-zinc-500">
            ReturnLab Logistics
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Return Intake
          </h1>

          <p className="mt-3 text-zinc-400">
            Log incoming returns and operational processing data.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Client Name">
              <select
                value={form.clientName}
                onChange={(e) =>
                  updateField("clientName", e.target.value)
                }
                className={inputClass}
              >
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date Received">
              <input
                type="date"
                value={form.dateReceived}
                onChange={(e) =>
                  updateField("dateReceived", e.target.value)
                }
                className={inputClass}
                required
              />
            </Field>

            <Field label="Tracking Number">
              <input
                type="text"
                value={form.trackingNumber}
                onChange={(e) =>
                  updateField("trackingNumber", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Carrier">
              <select
                value={form.carrier}
                onChange={(e) =>
                  updateField("carrier", e.target.value)
                }
                className={inputClass}
              >
                {carriers.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Item / SKU">
              <input
                type="text"
                value={form.itemSku}
                onChange={(e) =>
                  updateField("itemSku", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Qty">
              <input
                type="number"
                min={1}
                value={form.qty}
                onChange={(e) =>
                  updateField("qty", Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Condition">
              <select
                value={form.condition}
                onChange={(e) =>
                  updateField("condition", e.target.value)
                }
                className={inputClass}
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Return Reason">
              <input
                type="text"
                value={form.returnReason}
                onChange={(e) =>
                  updateField("returnReason", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Action Taken">
              <select
                value={form.actionTaken}
                onChange={(e) =>
                  updateField("actionTaken", e.target.value)
                }
                className={inputClass}
              >
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
                className={inputClass}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Time Spent (min)">
              <input
                type="number"
                value={form.timeSpent}
                onChange={(e) =>
                  updateField("timeSpent", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Estimated Resale Value">
              <input
                type="number"
                value={form.estimatedResaleValue}
                onChange={(e) =>
                  updateField(
                    "estimatedResaleValue",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </Field>

            <Field label="Storage Until">
              <input
                type="date"
                value={form.storageUntil}
                onChange={(e) =>
                  updateField("storageUntil", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Photo Link">
              <input
                type="text"
                value={form.photoLink}
                onChange={(e) =>
                  updateField("photoLink", e.target.value)
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              className={`${inputClass} min-h-[120px] resize-none`}
            />
          </Field>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Return"}
            </button>

            {success && (
              <p className="text-sm text-emerald-400">
                Return submitted successfully.
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm text-zinc-400">{label}</p>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-600";
