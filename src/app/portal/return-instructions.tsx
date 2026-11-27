"use client";

import { useActionState, useId, useState } from "react";
import { submitClientInstruction } from "./instruction-actions";

type Instruction = "warehouse_hold" | "disposal_authorized";

export default function ReturnInstructions({ returnId }: { returnId: string }) {
  const [state, submit, pending] = useActionState(submitClientInstruction, { result: "idle", message: "" } as const);
  const [selection, setSelection] = useState<Instruction | "">("");
  const [confirmed, setConfirmed] = useState(false);
  const fieldPrefix = useId();
  if (state.result === "saved") return <p role="status" className="mt-4 text-sm text-emerald-200">{state.message}</p>;
  return (
    <details className="mt-4 rounded-lg border border-zinc-700 px-3 py-2">
      <summary className="cursor-pointer text-sm font-semibold text-sky-200">Give ReturnLab instructions</summary>
      <form action={submit} className="mt-3 space-y-3">
        <input type="hidden" name="returnId" value={returnId} />
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">What should we do with this return?</legend>
          <label className="flex items-start gap-2 text-sm" htmlFor={`${fieldPrefix}-warehouse`}>
            <input id={`${fieldPrefix}-warehouse`} className="mt-0.5" type="radio" name="instruction" required
              value="warehouse_hold" checked={selection === "warehouse_hold"}
              onChange={() => { setSelection("warehouse_hold"); setConfirmed(false); }} />
            Hold for shipment to your U.S. warehouse
          </label>
          <label className="flex items-start gap-2 text-sm" htmlFor={`${fieldPrefix}-disposal`}>
            <input id={`${fieldPrefix}-disposal`} className="mt-0.5" type="radio" name="instruction" required
              value="disposal_authorized" checked={selection === "disposal_authorized"}
              onChange={() => { setSelection("disposal_authorized"); setConfirmed(false); }} />
            Authorize disposal
          </label>
        </fieldset>
        {selection && (
          <label className="flex items-start gap-2 text-sm text-zinc-200">
            <input type="checkbox" className="mt-0.5" name="confirmation" value={selection} required
              checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            {selection === "disposal_authorized"
              ? "I authorize ReturnLab to dispose of this return. I understand I can’t change this instruction in the portal."
              : "I confirm ReturnLab should hold this return for shipment. I understand I can’t change this instruction in the portal."}
          </label>
        )}
        <p className="text-xs text-zinc-300">Submitting records your instruction. It does not trigger shipment or disposal.</p>
        {state.message && <p role="status" className="text-sm text-amber-200">{state.message}</p>}
        <button type="submit" className="rounded-lg bg-sky-400 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          disabled={!selection || !confirmed || pending}>
          {pending ? "Submitting…" : "Submit instruction"}
        </button>
      </form>
    </details>
  );
}
