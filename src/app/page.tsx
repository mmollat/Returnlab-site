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
          alt="ReturnLab hero banner"
          className="h-auto w-full"
        />

        <div className="absolute inset-x-0 top-0 z-10 mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center justify-end gap-6 lg:gap-10">
            <nav className="hidden items-center gap-6 md:flex lg:gap-8">
              <a
                href="#services"
                className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500"
              >
                Services
              </a>

              <a
                href="#process"
                className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500"
              >
                How It Works
              </a>

              <a
                href="#pricing"
                className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500"
              >
                Pricing
              </a>

              <a
                href="#contact"
                className="text-sm font-bold uppercase tracking-wider text-white transition hover:text-orange-500"
              >
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
      <section
        id="process"
        className="border-b border-white/10 px-6 py-20 md:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
              Our Process
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">
              Simple. Transparent. Efficient.
            </h2>

            <p className="mt-6 max-w-md text-white/60">
              Every return is received, inspected, documented, and reported
              through a clean operational workflow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Return Shipped",
                "Customers ship returns to our U.S. facility.",
              ],
              [
                "02",
                "Received & Inspected",
                "We inspect, categorize, and document each item.",
              ],
              [
                "03",
                "Logged & Reported",
                "Condition, notes, and action are recorded.",
              ],
            ].map(([num, title, body]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
              >
                <div className="mb-8 text-sm font-black text-orange-500">
                  {num}
                </div>

                <h3 className="font-black">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  {body}
                </p>
              </div>
            ))}
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
            Built To Save You Time And Money
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              "Package Receiving",
              "Returns Processing",
              "Item Inspection",
              "Disposal Services",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
              >
                <div className="mb-5 h-10 w-10 rounded-full border border-orange-500/50 bg-orange-500/10" />

                <h3 className="font-black">{item}</h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Clean, reliable operational support designed for growing
                  e-commerce sellers.
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
            Plans Starting At $300/Month
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Simple, scalable return handling for international e-commerce
            sellers.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$300",
                detail: "Up to 50 returns/month",
              },
              {
                name: "Growth",
                price: "$500",
                detail: "Up to 120 returns/month",
                featured: true,
              },
              {
                name: "Scale",
                price: "$800",
                detail: "Up to 250 returns/month",
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
                  <span className="text-base font-normal text-white/45">
                    {" "}
                    / mo
                  </span>
                </div>

                <p className="mt-3 text-white/60">{plan.detail}</p>
              </div>
            ))}
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
            Contact us to discuss your package receiving, returns, inspection,
            disposal, or liquidation needs.
          </p>

          <form
            ref={formRef}
            action="/api/contact"
            method="POST"
            className="mt-8 space-y-4"
          >
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
