export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$300",
      detail: "Up to 50 returns per month",
      overage: "$3 per additional return",
      features: [
        "Package receiving",
        "Return logging",
        "7-day storage",
        "Disposal handling",
      ],
      cta: "Get Started",
    },
    {
      name: "Growth",
      price: "$500",
      detail: "Up to 120 returns per month",
      overage: "$2.50 per additional return",
      features: [
        "Everything in Starter",
        "14-day storage",
        "Basic resale sorting",
        "Monthly summary report",
      ],
      cta: "Get Started",
      featured: true,
    },
    {
      name: "Scale",
      price: "$800",
      detail: "Up to 250 returns per month",
      overage: "$2 per additional return",
      features: [
        "Everything in Growth",
        "Priority processing",
        "30-day storage",
        "Reporting and insights",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: "Custom",
      detail: "For high-volume sellers",
      overage: "Custom workflows available",
      features: [
        "Dedicated handling",
        "Extended storage",
        "Bulk resale coordination",
        "Direct support",
      ],
      cta: "Request Quote",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <a
            href="/"
            className="mb-10 inline-flex text-sm font-medium text-orange-500 hover:text-orange-400"
          >
            ← Back to Home
          </a>

          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
              Pricing
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Simple pricing for return handling.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Built for international sellers who need a reliable U.S. return
              address, package intake, tracking, storage, and return processing
              partner.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[32px] border p-6 shadow-sm ${
                plan.featured
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.featured && (
                <div className="mb-4 inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>

              <div className="mt-5">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-slate-500"> / month</span>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-600">{plan.detail}</p>
              <p className="mt-1 text-sm font-medium text-orange-500">
                {plan.overage}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <a
                href="/#contact"
                className="mt-8 block rounded-full bg-orange-500 px-5 py-3 text-center font-medium text-white transition hover:bg-orange-400"
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-slate-500">
          Pricing is designed to scale with your volume. No hidden fees.
          Transparent, predictable costs for growing e-commerce operations.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">
            What’s Included
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Secure package receiving",
              "Organized intake and tracking",
              "Short-term storage",
              "Inspection support",
              "Disposal routing",
              "Resale / liquidation support",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="rounded-[32px] border border-orange-200 bg-orange-50 p-7 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Need a custom workflow?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            For high-volume sellers or unique return handling requirements,
            ReturnLab can build a custom plan around your monthly volume and
            processing needs.
          </p>

          <a
            href="/#contact"
            className="mt-7 inline-flex rounded-full bg-orange-500 px-7 py-3 font-medium text-white transition hover:bg-orange-400"
          >
            Request a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
