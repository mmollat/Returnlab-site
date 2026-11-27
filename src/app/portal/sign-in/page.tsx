import type { Metadata } from "next";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = { title: "Client sign-in", robots: { index: false, follow: false } };

export default function ClientSignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">ReturnLab Logistics</p>
        <h1 className="mb-2 text-3xl font-semibold">Client portal</h1>
        <p className="mb-6 text-zinc-300">Sign in with the email address that ReturnLab set up for your company.</p>
        <SignInForm />
      </section>
    </main>
  );
}
