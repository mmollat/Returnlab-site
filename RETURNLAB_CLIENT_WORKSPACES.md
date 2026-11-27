# Client workspaces and portal

This release adds an internal client setup and intake page at `/intake/clients` (linked from `/intake`) and a separate customer login at `/portal`. The existing CTH and DGM intake and staff Reports remain unchanged for those clients. Do not share the staff credentials with a client.

## Before deployment

1. Apply the additive client-workspace migration against a non-production Supabase environment first. Existing returns are **not** made visible to the portal. Verify staff credentials and the server-only service key are configured. Configure `NEXT_PUBLIC_SUPABASE_URL` and an anon/publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for Auth verification. Do not put the service role in a browser variable.
2. In Supabase Auth, configure production SMTP for external email recipients and make sure the Magic Link email template includes the OTP token (`{{ .Token }}`). Review the effect on any existing sign-ins on this project before changing that shared template. Use the provider's OTP protections and test both delivery and expiry with a controlled address.
3. Use two test companies and accounts. Verify each sees only its own returns and photos, unauthorized browsers get no records, revocation blocks access, and no client can write through staff routes. Check that existing staff intake and reports still work in the deployment before rolling out.
4. Deploy the application only after the database migration and auth settings are verified. No production data, account for MB Heritage, or invitation is needed for this validation.

## Onboarding a customer

1. Staff: open Client workspaces, click Add a company, and enter its name, inspection checklist and monthly plan. Generic checklist/pricing defaults are editable at creation. Included storage defaults to 30 calendar days, can be set per company, and is calculated from the received date. This date does not book or confirm a shipment.
2. Once onboarding is approved, enter the authorized business email and click Grant access. This provisions a fresh OTP-only account and grants access without sending an email. If the address belongs to an unrelated existing Auth account, obtain admin verification instead of automatically granting it access. Supply the portal URL to the verified contact separately. Revoke removes portal access immediately on the next request.
3. Log a return by the merchant's return ID, product/SKU, received date and quantity. On arrival the client sees a pending inspection. Staff then records the condition, completes the checklist, publishes a client-visible summary and can attach an optional photo. The item stays on hold for the client to decide; this workflow never approves resale, issues a refund, or disposes of an item. Keep internal notes and personally identifying information out of both. Continue the promised inspection email and monthly report independently; the portal does not send those emails.
4. Report totals count distinct merchant return IDs within a month for managed clients, while inspection counts are line-item counts. Confirm the billing unit with each client before invoicing. Packaging and shipping are not calculated here.
