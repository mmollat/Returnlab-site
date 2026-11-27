-- Only opt-in portal records are eligible. Do not backfill/share history.
begin;
alter table public.returnlab_clients
  add column portal_enabled boolean not null default true,
  add column client_instructions_enabled boolean not null default false;
alter table public.returnlab_return_photos
  add column client_visible boolean not null default false;
alter table public.returnlab_returns
  add constraint returnlab_returns_id_client_unique unique (id, client_id);

create table public.returnlab_client_instructions (
  return_id bigint primary key,
  client_id uuid not null,
  instruction text not null check (instruction in ('warehouse_hold','disposal_authorized')),
  submitted_by uuid not null,
  submitted_at timestamptz not null default now(),
  foreign key (return_id,client_id) references public.returnlab_returns(id,client_id) on delete restrict
);
alter table public.returnlab_client_instructions enable row level security;
revoke all on public.returnlab_client_instructions from public, anon, authenticated, service_role;
grant select, insert on public.returnlab_client_instructions to service_role;

create function public.submit_returnlab_client_instruction(
  p_return_id bigint,p_client_id uuid,p_user_id uuid,p_instruction text
) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  inserted_id bigint;
begin
  if p_instruction is null or p_instruction not in ('warehouse_hold','disposal_authorized') then return false; end if;
  -- Lock the return while deciding eligibility and inserting the first instruction.
  -- Confirm membership in the same transaction, so a removed member cannot act on a stale page.
  perform 1 from public.returnlab_returns r
    join public.returnlab_clients c on c.id = r.client_id
    join public.returnlab_client_members m on m.client_id = c.id
    where r.id = p_return_id and r.client_id = p_client_id
      and c.active and c.portal_enabled and c.client_instructions_enabled and m.active and m.auth_user_id = p_user_id
      and r.inspected_at is not null and r.merchant_return_id is not null
      and r.status = 'On Hold' and r.outbound_status is distinct from 'Tendered to carrier'
    for update of r
    for share of m,c;
  if not found then return false; end if;
  insert into public.returnlab_client_instructions(return_id,client_id,submitted_by,instruction)
    values (p_return_id,p_client_id,p_user_id,p_instruction)
    on conflict (return_id) do nothing returning return_id into inserted_id;
  return inserted_id is not null;
end;
$$;
revoke all on function public.submit_returnlab_client_instruction(bigint,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.submit_returnlab_client_instruction(bigint,uuid,uuid,text) to service_role;

create function public.get_returnlab_client_dashboard(p_client_id uuid)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'warehouse_hold',coalesce(sum(r.qty) filter (where eligible.active and i.instruction='warehouse_hold'),0),
    'disposal_authorized',coalesce(sum(r.qty) filter (where eligible.active and i.instruction='disposal_authorized'),0),
    'awaiting_decision',coalesce(sum(r.qty) filter (where eligible.active and r.status='On Hold' and r.inspected_at is not null and i.return_id is null),0),
    'pending_inspection',coalesce(sum(r.qty) filter (where eligible.active and r.inspected_at is null),0),
    'findings_posted',coalesce(sum(r.qty) filter (where r.inspected_at is not null),0)
  ) from public.returnlab_returns r
  left join public.returnlab_client_instructions i on i.return_id=r.id and i.client_id=r.client_id
  cross join lateral (select (r.status not in ('Returned','Disposed') and r.outbound_status is distinct from 'Tendered to carrier') as active) eligible
  where r.client_id=p_client_id and r.merchant_return_id is not null;
$$;
revoke all on function public.get_returnlab_client_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.get_returnlab_client_dashboard(uuid) to service_role;

-- Company workspaces only: no client access or redistribution of existing records.
insert into public.returnlab_clients(name,checklist,included_storage_days,portal_enabled,client_instructions_enabled)
values ('CTH','[]',0,false,false),
       ('MB Heritage','["Original packaging checked","Accessories checked"]',30,true,true);
commit;
