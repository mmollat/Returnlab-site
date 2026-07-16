create table if not exists public.returnlab_returns (
  id bigint generated always as identity primary key,
  source_key text unique,
  client_name text not null,
  date_received date not null,
  tracking_number text,
  carrier text not null
    check (carrier in ('UPS', 'FedEx', 'USPS', 'DHL', 'Other')),
  item_sku text,
  qty integer not null default 1 check (qty > 0),
  condition text not null
    check (
      condition in (
        'New',
        'New (unopened)',
        'Like New',
        'Used',
        'Damaged',
        'Defective',
        'Unknown'
      )
    ),
  return_reason text,
  action_taken text not null
    check (
      action_taken in (
        'Keep (resale)',
        'Dispose',
        'Return to Client',
        'Return to client',
        'Hold for review'
      )
    ),
  status text not null
    check (
      status in (
        'Received',
        'Processing',
        'Completed',
        'On Hold',
        'Disposed',
        'Returned'
      )
    ),
  time_spent_minutes integer check (time_spent_minutes >= 0),
  estimated_resale_value numeric(12, 2)
    check (estimated_resale_value >= 0),
  storage_until date,
  photo_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists returnlab_returns_client_month_idx
  on public.returnlab_returns (client_name, date_received desc);

create unique index if not exists returnlab_returns_tracking_client_unique_idx
  on public.returnlab_returns (client_name, lower(tracking_number))
  where tracking_number is not null and btrim(tracking_number) <> '';

alter table public.returnlab_returns enable row level security;

revoke all on table public.returnlab_returns from anon, authenticated;
revoke all on sequence public.returnlab_returns_id_seq from anon, authenticated;
grant all on table public.returnlab_returns to service_role;
grant usage, select on sequence public.returnlab_returns_id_seq to service_role;

create or replace function public.set_returnlab_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_returnlab_updated_at() from public;

drop trigger if exists set_returnlab_returns_updated_at
  on public.returnlab_returns;

create trigger set_returnlab_returns_updated_at
before update on public.returnlab_returns
for each row
execute function public.set_returnlab_updated_at();
