export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-slate-900 md:px-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
        <img
          src="/returnlab-logo-v2.jpg"
          alt="ReturnLab Logistics logo"
          className="mx-auto h-24 w-auto object-contain"
        />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Thank you</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          We received your message and will get back to you soon.
        </p>

      </div>
    </main>
  );
}
