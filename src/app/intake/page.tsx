"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CLIENT_NAMES,
  CLIENT_WORKFLOWS,
  type ClientName,
  type PhotoCategory,
} from "@/lib/client-workflows";
import type {
  InspectionOutcome,
  OutboundStatus,
  ReturnInput,
} from "@/lib/returnlab-types";

const carriers = ["UPS", "FedEx", "USPS", "DHL", "Other"];
const conditions = ["New", "Like New", "Used", "Damaged", "Defective"];
const actions = [
  "Keep (resale)",
  "Hold for review",
  "Dispose",
  "Return to Client",
];
const statuses = ["Received", "Processing", "Completed", "On Hold"];
const outcomes: InspectionOutcome[] = [
  "Approved for resale",
  "Client review required",
  "Not approved",
  "Unable to determine",
];
const outboundStatuses: OutboundStatus[] = [
  "Not requested",
  "Awaiting client instructions",
  "Awaiting prepaid label",
  "Ready for carrier",
  "Tendered to carrier",
];
const steps = ["Return", "Inspect", "Photos", "Decision", "Review"];

type PhotoDraft = {
  category: PhotoCategory;
  file: File;
  previewUrl: string;
};

type FormState = ReturnInput & {
  inspectionOutcome: InspectionOutcome | "";
  outboundStatus: OutboundStatus | "";
};

function createInitialForm(clientName: ClientName = "CTH"): FormState {
  return {
    clientName,
    dateReceived: new Date().toISOString().slice(0, 10),
    trackingNumber: "",
    carrier: "UPS",
    itemSku: "",
    qty: 1,
    condition: "Used",
    returnReason: "",
    actionTaken: clientName === "DGM Group" ? "Hold for review" : "Dispose",
    status: clientName === "DGM Group" ? "On Hold" : "Received",
    timeSpent: "",
    estimatedResaleValue: "",
    storageUntil: "",
    photoLink: "",
    notes: "",
    inspectorName: "",
    inspectionOutcome: clientName === "DGM Group" ? "Client review required" : "",
    inspectionFindings: {},
    inspectionNotes: "",
    repackaged: null,
    replacementPolyBagUsed: null,
    outboundLabelReceived: null,
    outboundStatus:
      clientName === "DGM Group" ? "Awaiting client instructions" : "",
  };
}

export default function IntakePage() {
  const [form, setForm] = useState<FormState>(() => createInitialForm());
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const clientName = form.clientName as ClientName;
  const workflow = CLIENT_WORKFLOWS[clientName];
  const observedIssues = useMemo(
    () =>
      workflow.questions
        .filter((question) => form.inspectionFindings?.[question.key])
        .map((question) => question.label),
    [form.inspectionFindings, workflow.questions]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function changeClient(value: ClientName) {
    for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
    setPhotos([]);
    setForm((previous) => ({
      ...createInitialForm(value),
      dateReceived: previous.dateReceived,
      trackingNumber: previous.trackingNumber,
      carrier: previous.carrier,
      itemSku: previous.itemSku,
      qty: previous.qty,
      returnReason: previous.returnReason,
    }));
    setCurrentStep(0);
    setSuccessId(null);
    setMessage("");
  }

  function toggleFinding(key: string, checked: boolean) {
    setForm((previous) => ({
      ...previous,
      inspectionFindings: {
        ...previous.inspectionFindings,
        [key]: checked,
      },
    }));
  }

  function addPhoto(category: PhotoCategory, file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Each photo must be 8 MB or smaller.");
      return;
    }

    setMessage("");
    setPhotos((previous) => {
      const existing = previous.find((photo) => photo.category === category);
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      return [
        ...previous.filter((photo) => photo.category !== category),
        { category, file, previewUrl: URL.createObjectURL(file) },
      ];
    });
  }

  function removePhoto(category: PhotoCategory) {
    setPhotos((previous) => {
      const photo = previous.find((item) => item.category === category);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return previous.filter((item) => item.category !== category);
    });
  }

  function canContinue() {
    if (currentStep === 0) {
      return Boolean(form.clientName && form.dateReceived && form.qty >= 1);
    }

    if (currentStep === 3 && clientName === "DGM Group") {
      return Boolean(form.inspectorName?.trim() && form.inspectionOutcome);
    }

    return true;
  }

  function nextStep() {
    if (!canContinue()) {
      setMessage("Complete the required fields before continuing.");
      return;
    }
    setMessage("");
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  async function uploadPhotos(returnId: number) {
    const failures: string[] = [];

    for (const photo of photos) {
      const data = new FormData();
      data.append("returnId", String(returnId));
      data.append("category", photo.category);
      data.append("file", photo.file);

      const response = await fetch("/api/returns/photos", {
        method: "POST",
        body: data,
      });

      if (!response.ok) failures.push(photo.category);
    }

    return failures;
  }

  async function submitReturn() {
    if (!canContinue()) return;
    setLoading(true);
    setMessage("");
    setSuccessId(null);

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json().catch(() => null)) as
        | { id?: number; error?: string }
        | null;

      if (!response.ok || !result?.id) {
        throw new Error(result?.error || "Failed to submit intake.");
      }

      const failedPhotos = await uploadPhotos(result.id);
      setSuccessId(result.id);
      setMessage(
        failedPhotos.length
          ? `Return ${result.id} was saved, but these photos need to be retried: ${failedPhotos.join(", ")}.`
          : `Return ${result.id} and ${photos.length} photo${photos.length === 1 ? "" : "s"} saved successfully.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit intake.");
    } finally {
      setLoading(false);
    }
  }

  function startAnother() {
    for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
    setPhotos([]);
    setForm(createInitialForm(clientName));
    setCurrentStep(0);
    setSuccessId(null);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-zinc-500">
              ReturnLab Logistics
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Return Intake
            </h1>
            <p className="mt-2 text-zinc-400">
              Guided inspection and photo documentation
            </p>
          </div>
          <span className="w-fit rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400">
            {successId ? `Return ${successId}` : `${clientName} workflow`}
          </span>
        </header>

        <ol className="mb-6 grid grid-cols-5 gap-2" aria-label="Intake progress">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`flex min-w-0 items-center gap-2 text-xs sm:text-sm ${
                index === currentStep ? "text-white" : "text-zinc-600"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                  index <= currentStep
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                {index + 1}
              </span>
              <span className="hidden truncate sm:inline">{step}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7">
          {currentStep === 0 && (
            <StepSection
              title="Return details"
              description="Identify the client, package, and item."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Client">
                  <select
                    value={clientName}
                    onChange={(event) => changeClient(event.target.value as ClientName)}
                    className={inputClass}
                  >
                    {CLIENT_NAMES.map((client) => (
                      <option key={client}>{client}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date received" required>
                  <input
                    type="date"
                    value={form.dateReceived}
                    onChange={(event) => updateField("dateReceived", event.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Tracking number">
                  <input
                    value={form.trackingNumber}
                    onChange={(event) => updateField("trackingNumber", event.target.value)}
                    className={inputClass}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Carrier">
                  <select
                    value={form.carrier}
                    onChange={(event) => updateField("carrier", event.target.value)}
                    className={inputClass}
                  >
                    {carriers.map((carrier) => <option key={carrier}>{carrier}</option>)}
                  </select>
                </Field>
                <Field label="Item / SKU">
                  <input
                    value={form.itemSku}
                    onChange={(event) => updateField("itemSku", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Quantity" required>
                  <input
                    type="number"
                    min={1}
                    value={form.qty}
                    onChange={(event) => updateField("qty", Number(event.target.value))}
                    className={inputClass}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Return reason">
                    <input
                      value={form.returnReason}
                      onChange={(event) => updateField("returnReason", event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </StepSection>
          )}

          {currentStep === 1 && (
            <StepSection
              title={workflow.inspectionTitle}
              description={workflow.inspectionDescription}
            >
              <div className="mb-5 grid gap-5 md:grid-cols-2">
                <Field label="Condition">
                  <select
                    value={form.condition}
                    onChange={(event) => updateField("condition", event.target.value)}
                    className={inputClass}
                  >
                    {conditions.map((condition) => <option key={condition}>{condition}</option>)}
                  </select>
                </Field>
                {workflow.showEstimatedResaleValue && (
                  <Field label="Estimated resale value">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.estimatedResaleValue}
                      onChange={(event) => updateField("estimatedResaleValue", event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>

              {workflow.questions.length > 0 && (
                <div className="mb-6 grid gap-x-8 md:grid-cols-2">
                  {workflow.questions.map((question) => (
                    <label
                      key={question.key}
                      className="flex items-center justify-between gap-4 border-b border-zinc-800 py-3 text-sm"
                    >
                      <span>{question.label}</span>
                      <span className="flex items-center gap-2 text-zinc-400">
                        <input
                          type="checkbox"
                          checked={Boolean(form.inspectionFindings?.[question.key])}
                          onChange={(event) => toggleFinding(question.key, event.target.checked)}
                          className="h-4 w-4 accent-white"
                        />
                        Observed
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <Field label="Inspection notes">
                <textarea
                  value={form.inspectionNotes}
                  onChange={(event) => updateField("inspectionNotes", event.target.value)}
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder={
                    clientName === "DGM Group"
                      ? "Describe visible condition, issues, and anything requiring client review."
                      : "Add any condition or processing notes."
                  }
                />
              </Field>
            </StepSection>
          )}

          {currentStep === 2 && (
            <StepSection
              title="Photo documentation"
              description={
                clientName === "DGM Group"
                  ? "Add sample views or close-ups when an item has an issue. Photos are not required for every return."
                  : "Photos are optional and can be added when useful for documentation."
              }
              badge={`${photos.length} added`}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workflow.photoCategories.map((category) => {
                  const photo = photos.find((item) => item.category === category);
                  return (
                    <div
                      key={category}
                      className="overflow-hidden rounded-xl border border-zinc-800 bg-black"
                    >
                      {photo ? (
                        <div>
                          <Image
                            src={photo.previewUrl}
                            alt={`${category} preview`}
                            width={640}
                            height={420}
                            unoptimized
                            className="h-36 w-full object-cover"
                          />
                          <div className="flex items-center justify-between gap-3 p-3">
                            <span className="truncate text-sm">{category}</span>
                            <button
                              type="button"
                              onClick={() => removePhoto(category)}
                              className="text-xs text-zinc-400 underline hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="grid min-h-44 cursor-pointer place-items-center p-4 text-center hover:bg-zinc-900">
                          <span>
                            <span className="block text-sm font-medium">{category}</span>
                            <span className="mt-1 block text-xs text-zinc-500">
                              Take photo or choose image
                            </span>
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                            capture="environment"
                            className="sr-only"
                            onChange={(event) => addPhoto(category, event.target.files?.[0] ?? null)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </StepSection>
          )}

          {currentStep === 3 && (
            <StepSection
              title="Condition and disposition"
              description="Record the human-confirmed decision and next action."
              badge={`${observedIssues.length} issues observed`}
            >
              <div className="grid gap-5 md:grid-cols-2">
                {clientName === "DGM Group" && (
                  <Field label="Inspection outcome" required>
                    <select
                      value={form.inspectionOutcome}
                      onChange={(event) => updateField("inspectionOutcome", event.target.value as InspectionOutcome)}
                      className={inputClass}
                    >
                      {outcomes.map((outcome) => <option key={outcome}>{outcome}</option>)}
                    </select>
                  </Field>
                )}
                <Field label="Action taken">
                  <select
                    value={form.actionTaken}
                    onChange={(event) => updateField("actionTaken", event.target.value)}
                    className={inputClass}
                  >
                    {actions.map((action) => <option key={action}>{action}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className={inputClass}
                  >
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </Field>
                <Field label="Inspector" required={clientName === "DGM Group"}>
                  <input
                    value={form.inspectorName}
                    onChange={(event) => updateField("inspectorName", event.target.value)}
                    className={inputClass}
                    required={clientName === "DGM Group"}
                  />
                </Field>
                <Field label="Time spent (minutes)">
                  <input
                    type="number"
                    min={0}
                    value={form.timeSpent}
                    onChange={(event) => updateField("timeSpent", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Storage until">
                  <input
                    type="date"
                    value={form.storageUntil}
                    onChange={(event) => updateField("storageUntil", event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              {workflow.showOutboundHandling && (
                <div className="mt-7 border-t border-zinc-800 pt-6">
                  <h3 className="text-base font-medium">Outbound handling</h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <Field label="Outbound status">
                      <select
                        value={form.outboundStatus}
                        onChange={(event) => updateField("outboundStatus", event.target.value as OutboundStatus)}
                        className={inputClass}
                      >
                        {outboundStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </Field>
                    <TriStateField
                      label="Prepaid label received"
                      value={form.outboundLabelReceived ?? null}
                      onChange={(value) => updateField("outboundLabelReceived", value)}
                    />
                    <TriStateField
                      label="Refolded and repackaged"
                      value={form.repackaged ?? null}
                      onChange={(value) => updateField("repackaged", value)}
                    />
                    <TriStateField
                      label="Replacement poly bag used"
                      value={form.replacementPolyBagUsed ?? null}
                      onChange={(value) => updateField("replacementPolyBagUsed", value)}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Field label="Disposition notes">
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    className={`${inputClass} min-h-28 resize-y`}
                  />
                </Field>
              </div>
            </StepSection>
          )}

          {currentStep === 4 && (
            <StepSection
              title="Review inspection"
              description="Confirm the record before saving it to ReturnLab reports."
              badge={successId ? "Saved" : "Ready to submit"}
            >
              <dl className="divide-y divide-zinc-800 text-sm">
                <ReviewRow label="Client" value={clientName} />
                <ReviewRow label="Date received" value={form.dateReceived} />
                <ReviewRow label="Tracking" value={form.trackingNumber || "Not provided"} />
                <ReviewRow label="Item" value={`${form.itemSku || "Unspecified item"} · Qty ${form.qty}`} />
                <ReviewRow label="Condition" value={form.condition} />
                {clientName === "DGM Group" && (
                  <>
                    <ReviewRow label="Issues observed" value={observedIssues.join(", ") || "None observed"} />
                    <ReviewRow label="Inspection outcome" value={form.inspectionOutcome || "Not selected"} />
                  </>
                )}
                <ReviewRow label="Photos" value={`${photos.length} staged for upload`} />
                <ReviewRow label="Action" value={form.actionTaken} />
                <ReviewRow label="Status" value={form.status} />
                <ReviewRow label="Inspector" value={form.inspectorName || "Not provided"} />
                {workflow.showOutboundHandling && (
                  <ReviewRow label="Outbound status" value={form.outboundStatus || "Not selected"} />
                )}
                <ReviewRow label="Notes" value={form.notes || form.inspectionNotes || "No notes"} />
              </dl>

              {successId && (
                <button
                  type="button"
                  onClick={startAnother}
                  className="mt-6 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm hover:border-zinc-500"
                >
                  Start another return
                </button>
              )}
            </StepSection>
          )}

          {message && (
            <p
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                successId
                  ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
                  : "border-amber-900 bg-amber-950/40 text-amber-200"
              }`}
              role="status"
            >
              {message}
            </p>
          )}

          {!successId && (
            <div className="mt-7 flex items-center justify-between gap-4 border-t border-zinc-800 pt-5">
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setCurrentStep((step) => Math.max(0, step - 1));
                }}
                disabled={currentStep === 0 || loading}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitReturn}
                  disabled={loading}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Saving return..." : "Submit inspection"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StepSection({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        {badge && (
          <span className="w-fit rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function TriStateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value === null ? "" : value ? "yes" : "no"}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : event.target.value === "yes")
        }
        className={inputClass}
      >
        <option value="">Not recorded</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </Field>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="break-words text-zinc-200">{value}</dd>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500";
