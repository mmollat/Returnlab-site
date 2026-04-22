export default function Home() {
  const services = [
    "Package receiving",
    "Returns processing",
    "Item inspection",
    "Disposal services",
    "Resale / liquidation support",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10">
          <div className="max-w-4xl">
            <div className="mb-10">
              <img
                src="/returnlab-logo-v2.jpg"
                alt="ReturnLab Logistics logo"
                className="h-28 w-auto object-contain md:h-36"
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              U.S.-Based Returns, Inspection, and Reverse Logistics for E-Commerce Sellers
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              ReturnLab Logistics provides U.S.-based package receiving, returns processing, inspection, disposal, and resale/liquidation services for domestic and international e-commerce sellers.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex rounded-full bg-orange-500 px-7 py-3 font-medium text-white transition hover:bg-orange-400"
            >
              Request a Consultation
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Services</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm"
            >
              {service}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4 md:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">About Us</h2>
          <div className="mt-4 max-w-4xl space-y-5 text-base leading-8 text-slate-600">
            <p>
              ReturnLab Logistics is a U.S.-based returns processing and reverse logistics service built to support e-commerce sellers, especially those operating internationally.
            </p>
            <p>
              We specialize in handling the part of the business most sellers do not want to deal with: product returns. From package receiving and inspection to disposal and liquidation, we provide a simple, reliable solution for managing U.S.-based returns without the need for a local presence.
            </p>
            <p>
              Our goal is straightforward: help sellers reduce friction, save time, and operate more efficiently by taking returns off their plate.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-10">
        <div className="rounded-[32px] border border-orange-200 bg-orange-50 p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Contact Us</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Contact us to discuss your package receiving, returns, inspection, disposal, or liquidation needs.
          </p>

          <form
            action="https://formspree.io/f/mzdykjdo"
            method="POST"
            className="mt-6 space-y-4"
          >
            <input type="hidden" name="_subject" value="New ReturnLab Logistics contact form submission" />
            <input type="hidden" name="_next" value="https://www.returnlablogistics.com/thank-you" />

            <input
              name="name"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
              placeholder="Name"
            />
            <input
              name="company"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
              placeholder="Company"
            />
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
              placeholder="Email"
            />
            <textarea
              name="message"
              required
              className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
              placeholder="How can we help?"
            />
            <button className="w-full rounded-full bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-400">
              Contact Us
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
