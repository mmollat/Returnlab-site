"use client";

import { useActionState } from "react";
import { portalSignIn } from "./actions";

export default function SignInForm() {
  const [state, submit, pending] = useActionState(portalSignIn, {
    email: "", ready: false, message: "",
  });
  const input = "w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-white";
  return (
    <form action={submit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Work email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state.email} className={input} />
      </label>
      {state.ready && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email code</span>
          <input name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6,10}" maxLength={10} className={input} />
        </label>
      )}
      {state.message && <p role="status" className="text-sm text-zinc-300">{state.message}</p>}
      <div className="flex flex-wrap gap-3">
        {state.ready && (
          <button type="submit" name="intent" value="verify" disabled={pending}
            className="rounded-lg bg-sky-400 px-4 py-2 font-semibold text-black disabled:opacity-50">Sign in</button>
        )}
        <button type="submit" name="intent" value="request" formNoValidate={state.ready} disabled={pending}
          className={state.ready ? "rounded-lg border border-zinc-500 px-4 py-2 disabled:opacity-50" : "rounded-lg bg-sky-400 px-4 py-2 font-semibold text-black disabled:opacity-50"}>
          {state.ready ? "Send a new code" : "Email me a sign-in code"}
        </button>
      </div>
      {pending && <p role="status" className="text-sm text-zinc-300">One moment…</p>}
    </form>
  );
}
