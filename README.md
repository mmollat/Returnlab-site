# ReturnLab Site

ReturnLab Site is the public website and lightweight operations portal for
ReturnLab Logistics, a U.S.-based returns processing and reverse-logistics
service for e-commerce sellers.

The site presents ReturnLab's services, pricing, process, and contact flow,
while also supporting protected internal intake and monthly reporting pages.

## Included

- Public landing page for ReturnLab Logistics
- Services and process sections for package receiving, returns processing,
  item inspection, disposal, and reporting
- Pricing page with Starter, Growth, Scale, and Enterprise plans
- Contact form powered by Resend
- Thank-you confirmation page after contact submission
- Protected return intake form for operational logging
- Client-specific guided inspections for CTH and DGM Group
- Private Supabase Storage photo documentation
- Protected monthly reports dashboard
- Direct Supabase-backed return logging and live report aggregation
- Supabase-backed heartbeat endpoint for scheduled health updates
- Vercel cron configuration for the heartbeat route
- Basic Auth protection for `/reports` and `/intake`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Resend
- Vercel

## Key Routes

- `/` - public marketing homepage
- `/pricing` - pricing plans and included services
- `/thank-you` - contact form success page
- `/intake` - protected return intake form
- `/reports` - protected monthly reports dashboard
- `/api/contact` - contact form email handler
- `/api/heartbeat` - scheduled Supabase heartbeat endpoint

## Environment Variables

Create a `.env.local` file with:

```bash
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
REPORTS_USERNAME=your-basic-auth-username
REPORTS_PASSWORD=your-basic-auth-password
RETURNLAB_BASE_FEE=800
RETURNLAB_INCLUDED_RETURNS=100
RETURNLAB_OVERAGE_FEE=0
```

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- `/reports` and `/intake` are protected by Basic Auth in `middleware.ts`.
- The contact form sends email through Resend to ReturnLab's inbox.
- The intake form writes directly to the `returnlab_returns` Supabase table through a protected server route.
- The reports page calculates live monthly results from the same returns table.
- Apply the SQL migration in `supabase/migrations` before deploying these routes.
- Google Sheets and n8n are not part of the live intake or reporting workflow.
- `scripts/import-return-history.mjs` is retained only as a historical migration utility for the original Return Log.
- Vercel runs `/api/heartbeat` daily from `vercel.json`.
