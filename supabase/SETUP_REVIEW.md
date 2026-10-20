# Supabase setup review

The heartbeat route uses the server service-role key to update only `last_seen`
where `id = 1`; it neither inserts nor requests returned rows. The review candidate
`review/heartbeat_setup.sql` supplies the missing seed and grants only SELECT(id)
for filtering plus UPDATE(last_seen). It keeps RLS enabled and gives browser roles
no table or column access. Integer IDs are explicitly seeded, with no new sequence.

The candidate runs transactionally, preserves an existing row 1 timestamp, and is
repeatable on a compatible table. It accepts smallint/integer/bigint primary-key
IDs with timestamptz last_seen; unknown schemas or existing policies stop for
inspection. Extra mandatory columns, triggers, inheritance, inherited role grants,
and external consumers require separate review. Do not change a working existing
table merely to match this proposed schema. The prior live review reported a
working heartbeat; actual live schema compatibility has not been certified here.

No CLI executable is available in the review environment, so this SQL is outside
the automatic migration directory. After isolated/full Supabase testing and owner
approval, use `supabase migration new heartbeat_setup` and copy the reviewed SQL
into that generated file; confirm the runner's transaction conventions first.

Keep the service-only returns/photos grants and their identity-sequence grants.
The repo photos migration is `20260720000000`; the prior live history review found
`20260720231358` instead. Before any future CLI operation, compare both definitions
and the environment ledger, approve a reconciliation plan, and resolve the version
mismatch without rerunning table/storage operations. Do not `db push` this tree.
The existing cron migration schedules an HTTP call to a production URL: omit it
from isolated database tests. This patch does not add another cron or reports table.

Verify with synthetic data: apply candidate twice, retain original timestamp until
the service-role update, assert one row updated, deny anon/authenticated reads and
writes, and check service-role insert/delete denial. Then verify PostgREST behavior
in a disposable Supabase instance. The route currently reports success even if zero
rows match; a successful HTTP response alone does not prove a heartbeat update.

Rollback: a failed transaction leaves the prior state intact. After application,
restore the reviewed pre-change ACL snapshot if needed; keep the table and data.
Do not roll back by granting browser access or dropping a working heartbeat table.
