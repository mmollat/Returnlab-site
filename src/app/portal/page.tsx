import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalCompany } from "@/lib/client-portal-auth";
import { getPortalReturns } from "@/lib/client-portal-returns";
import { portalSignOut } from "./sign-in/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client returns", robots: { index: false, follow: false } };

export default async function PortalPage({ searchParams }: {
  searchParams: Promise<{ returnId?: string | string[]; page?: string | string[] }>;
}) {
  const company = await getPortalCompany();
  if (!company) redirect("/portal/sign-in");
  const params = await searchParams;
  const returnId = typeof params.returnId === "string" ? params.returnId.trim().slice(0, 100) : "";
  const pageNumber = typeof params.page === "string" && /^\d{1,5}$/.test(params.page) ? Number(params.page) : 1;
  const page = Math.max(1, pageNumber);
  const { rows, hasMore } = await getPortalReturns(company.id, page, returnId);
  const linkTo = (target: number) => "/portal?" + new URLSearchParams({
    page: String(target), ...(returnId ? { returnId } : {}),
  });
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <header>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">ReturnLab Logistics</p>
          <h1 className="text-3xl font-semibold">{company.name} returns</h1>
          <p className="mt-2 text-zinc-300">Review received parcels and completed inspections.</p>
        </header>
        <form action={portalSignOut}>
          <button className="whitespace-nowrap rounded-lg border border-zinc-600 px-3 py-2 text-sm">Sign out</button>
        </form>
      </div>
      <form action="/portal" method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1 space-y-1.5 text-sm">
          <span className="block font-medium">Return ID</span>
          <input className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2.5 text-white"
            name="returnId" type="search" placeholder="Enter the exact return ID" maxLength={100} defaultValue={returnId} />
        </label>
        <button className="rounded-lg bg-sky-400 px-4 py-2.5 font-semibold text-black">Search</button>
        {returnId && <Link href="/portal" className="rounded-lg border border-zinc-600 px-4 py-2.5">Clear search</Link>}
      </form>
      {rows.length === 0 && <p className="rounded-2xl border border-zinc-700 p-5 text-zinc-300">{returnId ? "No parcels found for this return ID." : "No parcels on this page."}</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map((row, index) => (
          <li key={`${row.merchant_return_id}-${index}`} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="break-all text-lg font-semibold">{row.merchant_return_id}</h2>
              <p className="rounded-full bg-sky-950 px-2.5 py-1 text-xs font-medium text-sky-200">{row.status}</p>
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-zinc-400">Received</dt><dd>{row.date_received}</dd>
              {row.item_sku && <><dt className="text-zinc-400">Item</dt><dd className="break-all">{row.item_sku}</dd></>}
              <dt className="text-zinc-400">Quantity</dt><dd>{row.qty}</dd>
              {row.inspected_at && <><dt className="text-zinc-400">Condition</dt><dd>{row.condition}</dd></>}
              <dt className="text-zinc-400">Inspection</dt>
              <dd>{row.inspected_at ? row.inspection_outcome || "Complete" : "Pending"}</dd>
            </dl>
            {row.inspected_at && row.client_summary && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-zinc-200">{row.client_summary}</p>}
            {row.inspected_at && row.returnlab_return_photos?.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {row.returnlab_return_photos.map((photo) => <li key={photo.id}><a className="block rounded-md border border-zinc-600 px-2.5 py-1.5 text-sm text-sky-200 underline"
                  href={`/portal/photos/${photo.id}`} target="_blank" rel="noopener noreferrer">{photo.photo_category}</a></li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {(page > 1 || hasMore) && <nav aria-label="Returns pagination" className="mt-6 flex gap-4">
        {page > 1 && <Link href={linkTo(page - 1)} className="text-sky-200 underline">Previous</Link>}
        {hasMore && <Link href={linkTo(page + 1)} className="text-sky-200 underline">Next</Link>}
      </nav>}
    </main>
  );
}
