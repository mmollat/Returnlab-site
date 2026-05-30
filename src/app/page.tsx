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
  {
    title: "Package Receiving",
    icon: "/icons/package-receiving-transparent.png",
  },
  {
    title: "Returns Processing",
    icon: "/icons/returns-processing-transparent.png",
  },
  {
    title: "Item Inspection",
    icon: "/icons/item-inspection-transparent.png",
  },
  {
    title: "Disposal Services",
    icon: "/icons/disposal-services-transparent.png",
  },
].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/10">
  <img
    src={item.icon}
    alt=""
    className="h-8 w-8 object-contain"
  />
</div>

                <h3 className="font-black">{item.title}</h3>

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
        className="border-y border-white/10 bg-white/[0.025] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-orange-500">
            Pricing
          </p>

          <h2 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
            Custom Pricing
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/65 md:text-lg">
            Every seller has different return volumes and operational requirements.
            We build custom plans based on monthly volume, inspection needs,
            storage requirements, and reporting frequency.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 rounded-[32px] border border-white/10 bg-black/35 p-7 text-left shadow-2xl shadow-black/30 md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="flex flex-col justify-center border-white/10 md:border-r md:pr-10">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-500">
                Starting At
              </p>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-7xl font-black tracking-tight md:text-8xl">
                  $300
                </span>
                <span className="pb-3 text-xl text-orange-500">/ mo</span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                "Custom plan built for your business",
                "Volume-based pricing",
                "All core services included",
                "Scales with your growth",
                "No long-term contracts",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-500 text-sm font-black text-orange-500">
                    ✓
                  </span>
                  <p className="text-sm text-white/75 md:text-base">{item}</p>
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              <a
                href="#contact"
                className="mx-auto mt-4 inline-flex w-full max-w-sm items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-400"
              >
                Contact Us →
              </a>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <div className="mb-7 flex items-center gap-5">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-500">
                Core Services Included
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-7 text-left">
                <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl border border-orange-500/40 bg-orange-500/10">
  <img
    src="/icons/package-receiving-transparent.png"
    alt="Package Receiving"
    className="h-10 w-10 object-contain"
  />
</div>
                <h3 className="text-xl font-black">Full-Service Returns</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Receiving, inspection, logging, reporting, storage, and
                  disposition handling.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-7 text-left">
                <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl border border-orange-500/40 bg-orange-500/10">
  <img
    src="/icons/item-inspection-transparent.png"
    alt="Item Inspection"
    className="h-10 w-10 object-contain"
  />
</div>
                <h3 className="text-xl font-black">Detailed Inspection</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Condition notes, photo documentation, and secure inventory
                  tracking when needed.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-sm leading-7 text-white/60">
            Have unique requirements or high return volume?{" "}
            <a href="#contact" className="font-bold text-orange-500 hover:text-orange-400">
              Contact us and we’ll build a plan that fits.
            </a>
          </p>
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
