alter table public.returnlab_returns
  add column if not exists inspector_name text,
  add column if not exists inspected_at timestamptz,
  add column if not exists inspection_outcome text
    check (
      inspection_outcome is null
      or inspection_outcome in (
        'Approved for resale',
        'Client review required',
        'Not approved',
        'Unable to determine'
      )
    ),
  add column if not exists inspection_findings jsonb not null default '{}'::jsonb,
  add column if not exists inspection_notes text,
  add column if not exists repackaged boolean,
  add column if not exists replacement_poly_bag_used boolean,
  add column if not exists outbound_label_received boolean,
  add column if not exists outbound_status text
    check (
      outbound_status is null
      or outbound_status in (
        'Not requested',
        'Awaiting client instructions',
        'Awaiting prepaid label',
        'Ready for carrier',
        'Tendered to carrier'
      )
    );

create table if not exists public.returnlab_return_photos (
  id bigint generated always as identity primary key,
  return_id bigint not null
    references public.returnlab_returns(id) on delete cascade,
  storage_path text not null unique,
  photo_category text not null
    check (
      photo_category in (
        'Front view',
        'Back view',
        'Product label',
        'Packaging',
        'Issue close-up',
        'Additional'
      )
    ),
  original_filename text,
  content_type text not null check (content_type like 'image/%'),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 8388608),
  created_at timestamptz not null default now()
);

create index if not exists returnlab_return_photos_return_id_idx
  on public.returnlab_return_photos (return_id, created_at);

alter table public.returnlab_return_photos enable row level security;

revoke all on table public.returnlab_return_photos from anon, authenticated;
revoke all on sequence public.returnlab_return_photos_id_seq from anon, authenticated;
grant all on table public.returnlab_return_photos to service_role;
grant usage, select on sequence public.returnlab_return_photos_id_seq to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'return-inspections',
  'return-inspections',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The app performs all database and storage operations through protected
-- server routes using service_role. Browser roles intentionally receive no
-- table or storage policies.
