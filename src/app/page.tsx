"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("fresh") === "1") {
      formRef.current?.reset();
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <img
          src="/returnlab-conveyor-hero.png"
          alt=""
          className="h-auto w-full"
        />

        <div className="sr-only">
          <p>U.S.-based returns processing and reverse logistics support</p>
          <h1>U.S. Processing Support Built For Global Brands</h1>
          <p>
            Receiving. Inspection. Storage. Reporting. We handle your U.S.
            processing needs so you can focus on growth.
          </p>
        </div>

        <div className="absolute inset-x-0 top-0 z-10 mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center justify-end gap-6 lg:gap-10">
            <nav className="hidden items-center gap-6 md:flex lg:gap-8">
              <a href="#services" className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500">
                Services
              </a>
              <a href="#process" className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500">
                How It Works
              </a>
              <a href="#pricing" className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500">
                Pricing
              </a>
              <a href="#contact" className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500">
                Contact
              </a>
            </nav>

            <a
              href="#contact"
              className="hidden rounded-full border border-orange-500/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-400 transition hover:bg-orange-500 hover:text-black md:inline-flex"
            >
              Partner With Us →
            </a>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="border-b border-white/10 px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
              Our Process
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">
              Simple. Transparent. Efficient.
            </h2>

            <p className="mt-6 max-w-md text-white/60">
              Returns are received, inspected, documented, and securely stored at our U.S. processing facility until further instructions are received.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Package Shipped", "Customers or suppliers ship packages to our U.S. processing facility."],
              ["02", "Received & Inspected", "We inspect, categorize, and document each item."],
              ["03", "Logged & Reported", "Condition, notes, and action are recorded."],
            ].map(([num, title, body]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <div className="mb-8 text-sm font-black text-orange-500">{num}</div>
                <h3 className="font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section className="border-b border-white/10 bg-white/[0.02] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
              Boutique Returns Partner
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">
              Built For Independent Cross-Border Sellers
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-white/65">
            <p>
              ReturnLab is designed for independent e-commerce sellers who need a reliable U.S. returns processing center for return receiving, supplier receiving, item inspection, inventory storage, documentation, and disposition support without the cost or complexity of a large commercial 3PL.
            </p>

            <p>
              ReturnLab is a U.S. operations center purpose-built for boutique returns processing, not semi-truck volume or massive corporate networks. Our operating model is intentionally lean, flexible, and hands-on — ideal for sellers who need personal communication, fast handling, and practical return support.
            </p>

            <div className="grid gap-4 pt-2 md:grid-cols-2">
              {[
                "Private U.S. operations partner",
                "Ideal for cross-border sellers",
                "Flexible monthly workflows",
                "Direct communication",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
            Why ReturnLab
          </p>

          <h2 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-none md:text-5xl">
            Flexible U.S. Processing Without 3PL Complexity
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              {
                title: "Return Processing",
                icon: "/icons/package-receiving-transparent.png",
                body: "Give customers a dependable U.S. return destination with organized intake, logging, and seller-specific handling instructions.",
              },
              {
                title: "Product Inspection",
                icon: "/icons/item-inspection-transparent.png",
                body: "Document product condition with practical notes so you can decide whether to store, dispose, reship, or review an item.",
              },
              {
                title: "Inventory Storage",
                icon: "/icons/returns-processing-transparent.png",
                body: "Securely store processed returns and received inventory at our U.S. processing facility until further instructions are received.",
              },
              {
                title: "Supplier Receiving",
                icon: "/icons/package-receiving-transparent.png",
                body: "Receive inbound supplier shipments at our U.S. operations center with organized intake, documentation, and handling based on your instructions.",
              },
              {
                title: "Reverse Logistics Support",
                icon: "/icons/disposal-services-transparent.png",
                body: "Coordinate storage, disposal, resale preparation, or reshipping for returned and unwanted inventory based on your workflow.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/10">
                  <img src={item.icon} alt="" className="h-8 w-8 object-contain" />
                </div>

                <h3 className="font-black">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
<section
  id="pricing"
  className="border-y border-white/10 bg-white/[0.025] px-6 py-20 md:px-10"
>
  <div className="mx-auto max-w-7xl text-center">
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
      Pricing
    </p>

    <h2 className="text-4xl font-black uppercase md:text-5xl">
      Transparent Monthly Pricing
    </h2>

    <p className="mx-auto mt-5 max-w-3xl text-white/60">
      Simple, scalable returns processing and reverse logistics support for
      international and cross-border e-commerce sellers.
    </p>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {[
        {
          name: "Starter",
          price: "$300",
          included: "Up to 50 returns/month",
          features: [
            "Package Receiving",
            "Return Logging",
            "Basic Item Inspection",
            "Monthly Reporting",
          ],
        },
        {
          name: "Growth",
          price: "$500",
          included: "Up to 120 returns/month",
          featured: true,
          features: [
            "Everything in Starter",
            "Priority Processing",
            "Enhanced Reporting",
            "Best Value",
          ],
        },
        {
          name: "Scale",
          price: "Custom",
          included: "250+ returns/month",
          features: [
            "Dedicated Workflows",
            "Volume Discounts",
            "Custom Reporting",
            "Flexible Solutions",
          ],
        },
      ].map((plan) => (
        <div
          key={plan.name}
          className={`rounded-[28px] border p-6 text-left shadow-sm ${
            plan.featured
              ? "border-orange-500 bg-orange-500/10"
              : "border-white/10 bg-white/[0.035]"
          }`}
        >
          {plan.featured && (
            <div className="mb-4 inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-black">
              Most Popular
            </div>
          )}

          <h3 className="text-xl font-black">{plan.name}</h3>

          <div className="mt-4 text-4xl font-black">
            {plan.price}
            {plan.price !== "Custom" && (
              <span className="text-base font-normal text-white/45">
                {" "}
                / mo
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-orange-400">
            {plan.included}
          </p>

          <div className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm text-white/65"
              >
                <span className="text-orange-500">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-black/30 p-6 text-center text-sm leading-7 text-white/60">
      Additional returns may be billed based on monthly volume. Custom plans
      are available for sellers with unique requirements or higher return
      volumes.
    </div>
  </div>
</section>

      {/* CONTACT */}
      <section id="contact" className="px-6 pb-24 pt-20 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-orange-500/25 bg-gradient-to-br from-orange-500/15 to-white/[0.03] p-7 md:p-10">
          <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
            Contact ReturnLab
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
            Contact us to discuss return processing, product inspection, inventory storage, supplier receiving, or custom reverse logistics support at our U.S. processing facility.
          </p>

          <form ref={formRef} action="/api/contact" method="POST" className="mt-8 space-y-4">
            <input
              name="name"
              required
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-orange-500"
              placeholder="Name"
            />

            <input
              name="company"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-orange-500"
              placeholder="Company"
            />

            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-orange-500"
              placeholder="Email"
            />

            <textarea
              name="message"
              required
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-orange-500"
              placeholder="How can we help?"
            />

            <button className="w-full rounded-full bg-orange-500 px-6 py-3 font-black uppercase tracking-widest text-black transition hover:bg-orange-400">
              Contact Us
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
