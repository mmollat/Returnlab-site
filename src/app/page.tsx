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
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: "url('/returnlab-conveyor-hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/35" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-10">
          <div className="flex items-center justify-between">
            <img
              src="/returnlab-logo-v2.jpg"
              alt="ReturnLab Logistics logo"
              className="h-20 w-auto object-contain md:h-24"
            />

            <a
              href="#contact"
              className="hidden rounded-full border border-orange-500/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-400 transition hover:bg-orange-500 hover:text-black md:inline-flex"
            >
              Partner With Us →
            </a>
          </div>

          <div className="grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-orange-500">
                U.S.-Based Returns & Reverse Logistics
              </p>

              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight md:text-7xl">
                Return Processing Built For{" "}
                <span className="text-orange-500">Global Brands</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/75">
                Intake. Inspection. Reporting. ReturnLab handles your U.S.-based returns so your
                team can reduce costs, move faster, and make better disposition decisions.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#process"
                  className="rounded-full bg-orange-500 px-7 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-orange-400"
                >
                  View Our Process →
                </a>

                <a
                  href="#contact"
                  className="rounded-full border border-white/25 px-7 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:border-orange-500 hover:text-orange-400"
                >
                  Request Consultation
                </a>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-white/10 bg-black/55 p-5 shadow-2xl backdrop-blur-xl md:grid-cols-2">
              {[
                ["1.6 Days", "Avg. Processing Time"],
                ["98.7%", "Inspection Accuracy"],
                ["U.S.", "Return Facility"],
                ["Monthly", "Client Reporting"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-5 h-10 w-10 rounded-full border border-orange-500/50 bg-orange-500/10" />
                  <div className="text-3xl font-black">{value}</div>
                  <div className="mt-2 text-sm text-white/60">{label}</div>
                </div>
              ))}
            </div>
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
              Every return is received, inspected, documented, and reported through a clean
              operational workflow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[
              ["01", "Return Shipped", "Customers ship returns to our U.S. facility."],
              ["02", "Received & Inspected", "We inspect, categorize, and document each item."],
              ["03", "Logged & Reported", "Condition, notes, and action are recorded."],
              ["04", "Monthly Reporting", "Clients receive clear return activity reports."],
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

      {/* DASHBOARD */}
      <section className="border-b border-white/10 px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-black">ReturnLab Dashboard</div>
              <div className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                Monthly Report
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Total Returns", "12,842"],
                ["Approved / Keep", "7,532"],
                ["Dispose", "5,310"],
                ["Avg. Time", "1.6d"],
              ].map(([item, value]) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs text-white/45">{item}</div>
                  <div className="mt-3 text-2xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="h-56 rounded-2xl border border-white/10 bg-gradient-to-t from-orange-500/20 to-white/[0.03] p-5">
                <div className="text-sm font-bold text-white/70">Returns Over Time</div>
                <div className="mt-16 h-20 rounded-xl border border-orange-500/20 bg-orange-500/10" />
              </div>

              <div className="h-56 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-sm font-bold text-white/70">Disposition Breakdown</div>
                <div className="mx-auto mt-10 h-28 w-28 rounded-full border-[18px] border-orange-500/70" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
              Real-Time Visibility
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">
              Data You Can Act On
            </h2>

            <p className="mt-6 text-white/60">
              Clients get visibility into every return, inspection result, disposition decision,
              and monthly activity summary.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES / WHY */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-500">
            Why ReturnLab
          </p>

          <h2 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-none md:text-5xl">
            Built To Save You Time And Money
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              "Package Receiving",
              "Returns Processing",
              "Item Inspection",
              "Disposal Services",
              "Resale / Liquidation Support",
              "Monthly Reporting",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <div className="mb-5 h-10 w-10 rounded-full border border-orange-500/50 bg-orange-500/10" />
                <h3 className="font-black">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  Clean, reliable operational support designed for growing e-commerce sellers.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
            Pricing
          </p>

          <h2 className="text-4xl font-black uppercase md:text-5xl">
            Plans Starting At $300/Month
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Simple, scalable return handling for international e-commerce sellers.
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
                  <span className="text-base font-normal text-white/45"> / mo</span>
                </div>

                <p className="mt-3 text-white/60">{plan.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/pricing"
              className="rounded-full bg-orange-500 px-6 py-3 font-bold text-black transition hover:bg-orange-400"
            >
              View Full Pricing
            </a>

            <a
              href="#contact"
              className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              Get Started
            </a>
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
            Contact us to discuss your package receiving, returns, inspection, disposal, or
            liquidation needs.
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
