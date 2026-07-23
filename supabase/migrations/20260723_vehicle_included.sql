-- Per-vehicle "included in rental" bullet points (admin-editable).
alter table public.vehicles
  add column if not exists included text[] not null default '{}';
