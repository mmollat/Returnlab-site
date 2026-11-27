-- Additive: existing returns stay attached to existing internal reports only.
begin;
create table public.returnlab_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 100),
  active boolean not null default true,
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  included_storage_days integer not null default 30 check (included_storage_days between 0 and 365),
  monthly_fee numeric(10,2) not null default 300 check (monthly_fee >= 0),
  included_returns integer not null default 50 check (included_returns between 0 and 100000),
  overage_fee numeric(10,2) not null default 6 check (overage_fee >= 0),
  created_at timestamptz not null default now()
);
create unique index returnlab_clients_name_uidx on public.returnlab_clients (lower(btrim(name)));
create table public.returnlab_client_members (
  client_id uuid not null references public.returnlab_clients(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and length(email) between 3 and 254),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (client_id, email)
);
create unique index returnlab_client_members_active_email_uidx on public.returnlab_client_members(email) where active;
create unique index returnlab_client_members_active_user_uidx on public.returnlab_client_members(auth_user_id) where active;

alter table public.returnlab_clients enable row level security;
alter table public.returnlab_client_members enable row level security;
revoke all on public.returnlab_clients, public.returnlab_client_members from public, anon, authenticated;
grant select, insert, update on public.returnlab_clients, public.returnlab_client_members to service_role;

alter table public.returnlab_returns
  add column client_id uuid references public.returnlab_clients(id) on delete restrict,
  add column merchant_return_id text,
  add column client_summary text,
  add constraint returnlab_managed_return_fields_check check (
    client_id is null or (merchant_return_id is not null and length(btrim(merchant_return_id)) between 1 and 100)
  );
-- Keep legacy condition grades and new factual observations separate.
alter table public.returnlab_returns
  drop constraint returnlab_returns_condition_check,
  add constraint returnlab_returns_condition_check check (
    (client_id is null and condition in ('New', 'New (unopened)', 'Like New', 'Used', 'Damaged', 'Defective', 'Unknown'))
    or (client_id is not null and (
      (inspected_at is null and condition = 'Unknown')
      or (inspected_at is not null and condition in ('Sealed / not opened', 'No visible issues', 'Wear or damage observed', 'Unable to verify'))
    ))
  );
create index returnlab_returns_client_arrival_idx on public.returnlab_returns(client_id,date_received desc,id desc) where client_id is not null;
-- Preserve the legacy tracking constraint for existing workflows.
drop index public.returnlab_returns_tracking_client_unique_idx;
create unique index returnlab_returns_tracking_client_unique_idx on public.returnlab_returns
  (client_name,lower(tracking_number)) where client_id is null and tracking_number is not null and btrim(tracking_number) <> '';
-- An RMA can cover multiple SKUs or parcels. Prevent exact repeat entries while
-- leaving legacy rows unchanged and allowing separate tracked parcels.
create unique index returnlab_returns_managed_entry_uidx on public.returnlab_returns (
  client_id, lower(btrim(merchant_return_id)), lower(coalesce(btrim(item_sku), '')), lower(coalesce(btrim(tracking_number), ''))
) where client_id is not null;
commit;
