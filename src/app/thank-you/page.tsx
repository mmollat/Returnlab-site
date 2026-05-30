export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-24 text-white">
      <div className="w-full max-w-3xl rounded-[32px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-white/[0.02] p-10 text-center shadow-2xl shadow-black/40 md:p-14">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-500">
          ReturnLab Logistics
        </p>

        <h1 className="mt-6 text-5xl font-black uppercase tracking-tight md:text-6xl">
          Message Received
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/65">
          Thank you for contacting ReturnLab. Your message has been received and
          a member of our team will get back to you shortly.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-400"
          >
            Return Home
          </a>

          <a
            href="/#services"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-orange-500 hover:text-orange-400"
          >
            View Services
          </a>
        </div>
      </div>
    </main>
  );
}
