-- ASK RENT A CAR — Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Project: https://auorvqfympkxtikwvaqg.supabase.co

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type locale_code as enum ('tr', 'en', 'ru');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency_code as enum ('TRY', 'GBP', 'EUR');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fuel_type as enum ('petrol', 'diesel', 'hybrid', 'electric');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transmission_type as enum ('automatic', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_status as enum ('available', 'rented', 'maintenance', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'delivered', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('card', 'cash', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('image', 'video', '360');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('paid', 'due', 'void');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  role user_role not null default 'customer',
  locale locale_code not null default 'tr',
  currency currency_code not null default 'EUR',
  avatar_url text,
  license_number text,
  passport_number text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Auth/profile helpers (after profiles exists)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, phone, role, locale, currency
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'),
    coalesce((new.raw_user_meta_data->>'locale')::locale_code, 'tr'),
    coalesce((new.raw_user_meta_data->>'currency')::currency_code, 'EUR')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  description jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  icon text not null default 'car',
  image_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  city text not null,
  address jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  lat double precision not null default 0,
  lng double precision not null default 0,
  phone text not null default '',
  is_airport boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand text not null,
  model text not null,
  plate text not null,
  chassis text,
  category_id uuid references public.categories (id) on delete set null,
  status vehicle_status not null default 'available',
  featured boolean not null default false,
  rating numeric(3,2) not null default 5.0,
  review_count int not null default 0,
  mileage int not null default 0,
  -- specs
  year int not null,
  fuel fuel_type not null default 'petrol',
  transmission transmission_type not null default 'automatic',
  seats int not null default 5,
  bags int not null default 2,
  doors int not null default 4,
  ac boolean not null default true,
  engine text,
  horsepower int,
  consumption text,
  drivetrain text,
  -- pricing
  price_daily numeric(12,2) not null,
  price_weekly numeric(12,2),
  price_monthly numeric(12,2),
  currency currency_code not null default 'EUR',
  discount_percent numeric(5,2) not null default 0,
  deposit numeric(12,2) not null default 0,
  insurance_daily numeric(12,2) not null default 0,
  features text[] not null default '{}',
  video_url text,
  description jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  insurance_expiry date,
  maintenance_due date,
  inspection_due date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  url text not null,
  alt text not null default '',
  type media_type not null default 'image',
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vehicle_blocked_periods (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  check (end_at > start_at)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, vehicle_id)
);

create table if not exists public.add_ons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  description jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  price_daily numeric(12,2) not null default 0,
  icon text not null default 'plus',
  mandatory boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  status booking_status not null default 'pending',
  pickup_location_id uuid references public.locations (id) on delete set null,
  dropoff_location_id uuid references public.locations (id) on delete set null,
  pickup_at timestamptz not null,
  return_at timestamptz not null,
  daily_rate numeric(12,2) not null,
  days int not null,
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  extras_total numeric(12,2) not null default 0,
  insurance_total numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  currency currency_code not null default 'EUR',
  -- guest / customer snapshot
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  license_front_url text,
  license_back_url text,
  license_front_name text,
  license_back_name text,
  payment_method payment_method not null default 'cash',
  payment_status payment_status not null default 'pending',
  notes text,
  campaign_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (return_at > pickup_at),
  check (days > 0)
);

create table if not exists public.booking_add_ons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  add_on_id uuid not null references public.add_ons (id) on delete restrict,
  quantity int not null default 1,
  unit_price numeric(12,2) not null default 0,
  unique (booking_id, add_on_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null default '',
  comment text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  excerpt jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  content jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  cover_image text,
  category text not null default 'News',
  tags text[] not null default '{}',
  author text not null default 'ASK Editorial',
  published_at timestamptz,
  reading_minutes int not null default 5,
  seo_title jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  seo_description jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  description jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  code text not null unique,
  discount_percent numeric(5,2) not null default 0,
  image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

create table if not exists public.campaign_categories (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (campaign_id, category_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  href text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  number text not null unique,
  amount numeric(12,2) not null,
  currency currency_code not null default 'EUR',
  issued_at timestamptz not null default timezone('utc', now()),
  status invoice_status not null default 'due',
  pdf_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text not null default '',
  type media_type not null default 'image',
  folder text not null default 'general',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'ASK RENT A CAR',
  logo_url text not null default '/logo.png',
  favicon_url text not null default '/logo.png',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default 'info@askrentacar.com',
  address jsonb not null default '{"tr":"","en":"","ru":""}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  smtp jsonb not null default '{}'::jsonb,
  analytics jsonb not null default '{}'::jsonb,
  maps jsonb not null default '{}'::jsonb,
  exchange_rates jsonb not null default '{"EUR":1,"GBP":0.86,"TRY":36.5}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (
  id, brand_name, phone, whatsapp, email, address, seo, maps, exchange_rates
) values (
  1,
  'ASK RENT A CAR',
  '+90 392 815 00 00',
  '+905338881122',
  'info@askrentacar.com',
  '{"tr":"Girne Liman Caddesi No:12, KKTC","en":"Kyrenia Harbour Street 12, TRNC","ru":"Гавань Кирении 12, ТРСК"}'::jsonb,
  '{"title":{"tr":"ASK RENT A CAR | KKTC Premium Araç Kiralama","en":"ASK RENT A CAR | Premium Car Rental","ru":"ASK RENT A CAR"},"description":{"tr":"Kuzey Kıbrıs premium araç kiralama","en":"Premium car rental in Northern Cyprus","ru":"Премиальная аренда"},"keywords":["kktc","rent a car","girne"]}'::jsonb,
  '{"embedUrl":"https://maps.google.com/maps?q=Kyrenia%20Harbour&output=embed","lat":35.3417,"lng":33.3167}'::jsonb,
  '{"EUR":1,"GBP":0.86,"TRY":36.5}'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_vehicles_status on public.vehicles (status);
create index if not exists idx_vehicles_category on public.vehicles (category_id);
create index if not exists idx_vehicles_featured on public.vehicles (featured);
create index if not exists idx_vehicle_images_vehicle on public.vehicle_images (vehicle_id, sort_order);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_user on public.bookings (user_id);
create index if not exists idx_bookings_vehicle on public.bookings (vehicle_id);
create index if not exists idx_bookings_pickup on public.bookings (pickup_at);
create index if not exists idx_reviews_vehicle on public.reviews (vehicle_id);
create index if not exists idx_notifications_user on public.notifications (user_id, read);
create index if not exists idx_campaigns_code on public.campaigns (code);
create index if not exists idx_blog_slug on public.blog_posts (slug);

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_locations_updated on public.locations;
create trigger trg_locations_updated before update on public.locations
for each row execute function public.set_updated_at();

drop trigger if exists trg_vehicles_updated on public.vehicles;
create trigger trg_vehicles_updated before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists trg_add_ons_updated on public.add_ons;
create trigger trg_add_ons_updated before update on public.add_ons
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_updated on public.blog_posts;
create trigger trg_blog_updated before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_campaigns_updated on public.campaigns;
create trigger trg_campaigns_updated before update on public.campaigns
for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Booking code helper
-- ---------------------------------------------------------------------------
create or replace function public.generate_booking_code()
returns trigger
language plpgsql
as $$
begin
  if new.code is null or new.code = '' then
    new.code := 'ASK-' || to_char(timezone('utc', now()), 'YYYY') || '-' ||
      lpad((floor(random() * 9000) + 1000)::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_booking_code on public.bookings;
create trigger trg_booking_code
  before insert on public.bookings
  for each row execute function public.generate_booking_code();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_blocked_periods enable row level security;
alter table public.favorites enable row level security;
alter table public.add_ons enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_add_ons enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_categories enable row level security;
alter table public.notifications enable row level security;
alter table public.invoices enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin() or auth.uid() = id);

-- Public read catalogs
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "locations_public_read" on public.locations;
create policy "locations_public_read" on public.locations for select using (true);
drop policy if exists "locations_admin_all" on public.locations;
create policy "locations_admin_all" on public.locations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "vehicles_public_read" on public.vehicles;
create policy "vehicles_public_read" on public.vehicles for select using (true);
drop policy if exists "vehicles_admin_all" on public.vehicles;
create policy "vehicles_admin_all" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "vehicle_images_public_read" on public.vehicle_images;
create policy "vehicle_images_public_read" on public.vehicle_images for select using (true);
drop policy if exists "vehicle_images_admin_all" on public.vehicle_images;
create policy "vehicle_images_admin_all" on public.vehicle_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blocked_public_read" on public.vehicle_blocked_periods;
create policy "blocked_public_read" on public.vehicle_blocked_periods for select using (true);
drop policy if exists "blocked_admin_all" on public.vehicle_blocked_periods;
create policy "blocked_admin_all" on public.vehicle_blocked_periods for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "addons_public_read" on public.add_ons;
create policy "addons_public_read" on public.add_ons for select using (true);
drop policy if exists "addons_admin_all" on public.add_ons;
create policy "addons_admin_all" on public.add_ons for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts for select using (published = true or public.is_admin());
drop policy if exists "blog_admin_all" on public.blog_posts;
create policy "blog_admin_all" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "campaigns_public_read" on public.campaigns;
create policy "campaigns_public_read" on public.campaigns for select using (true);
drop policy if exists "campaigns_admin_all" on public.campaigns;
create policy "campaigns_admin_all" on public.campaigns for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "campaign_cats_public_read" on public.campaign_categories;
create policy "campaign_cats_public_read" on public.campaign_categories for select using (true);
drop policy if exists "campaign_cats_admin_all" on public.campaign_categories;
create policy "campaign_cats_admin_all" on public.campaign_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);
drop policy if exists "reviews_insert_auth" on public.reviews;
create policy "reviews_insert_auth" on public.reviews for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select using (true);
drop policy if exists "settings_admin_all" on public.site_settings;
create policy "settings_admin_all" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media_public_read" on public.media_assets;
create policy "media_public_read" on public.media_assets for select using (true);
drop policy if exists "media_admin_all" on public.media_assets;
create policy "media_admin_all" on public.media_assets for all using (public.is_admin()) with check (public.is_admin());

-- Favorites
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Bookings: anyone can create (guest), owner/admin read/update
drop policy if exists "bookings_insert_anyone" on public.bookings;
create policy "bookings_insert_anyone" on public.bookings
  for insert with check (true);

drop policy if exists "bookings_select_own_or_admin" on public.bookings;
create policy "bookings_select_own_or_admin" on public.bookings
  for select using (
    public.is_admin()
    or auth.uid() = user_id
    or (auth.jwt() ->> 'email') = customer_email
  );

drop policy if exists "bookings_update_admin" on public.bookings;
create policy "bookings_update_admin" on public.bookings
  for update
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "bookings_delete_admin" on public.bookings;
create policy "bookings_delete_admin" on public.bookings
  for delete using (public.is_admin());

drop policy if exists "booking_addons_select" on public.booking_add_ons;
create policy "booking_addons_select" on public.booking_add_ons
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "booking_addons_insert" on public.booking_add_ons;
create policy "booking_addons_insert" on public.booking_add_ons
  for insert with check (true);

drop policy if exists "booking_addons_admin" on public.booking_add_ons;
create policy "booking_addons_admin" on public.booking_add_ons
  for all using (public.is_admin()) with check (public.is_admin());

-- Notifications / invoices
drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "invoices_own_or_admin" on public.invoices;
create policy "invoices_own_or_admin" on public.invoices for select
  using (auth.uid() = user_id or public.is_admin());
drop policy if exists "invoices_admin_all" on public.invoices;
create policy "invoices_admin_all" on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets (license + vehicle images)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('licenses', 'licenses', false),
  ('vehicles', 'vehicles', true),
  ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "licenses_upload_auth" on storage.objects;
create policy "licenses_upload_auth" on storage.objects
  for insert to authenticated, anon
  with check (bucket_id = 'licenses');

drop policy if exists "licenses_read_own_or_admin" on storage.objects;
create policy "licenses_read_own_or_admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'licenses'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "vehicles_public_read" on storage.objects;
create policy "vehicles_public_read" on storage.objects
  for select using (bucket_id in ('vehicles', 'media'));

drop policy if exists "vehicles_admin_write" on storage.objects;
create policy "vehicles_admin_write" on storage.objects
  for all using (
    bucket_id in ('vehicles', 'media') and public.is_admin()
  ) with check (
    bucket_id in ('vehicles', 'media') and public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Done
-- Next steps:
-- 1) Authentication → Users → Create admin user
-- 2) SQL: update profiles set role = 'admin' where email = 'admin@askrentacar.com';
-- 3) Add env keys to the Next.js app and implement supabase repositories
-- ---------------------------------------------------------------------------
