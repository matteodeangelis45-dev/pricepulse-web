create extension if not exists pgcrypto;

create type if not exists subscription_tier as enum ('free', 'pro', 'team', 'enterprise');
create type if not exists offer_availability as enum ('in_stock', 'limited_stock', 'out_of_stock', 'preorder', 'unknown');
create type if not exists tracking_job_status as enum ('queued', 'running', 'succeeded', 'failed', 'paused');
create type if not exists notification_type as enum ('price_drop', 'watchlist_alert', 'historical_low', 'trend_reversal', 'market_shift', 'system');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  subscription_tier subscription_tier not null default 'free',
  settings jsonb not null default '{}'::jsonb
);

create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo text,
  affiliate_base_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products_v2 (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  brand text,
  category text not null,
  image_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);

create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products_v2(id) on delete cascade,
  retailer_id uuid not null references public.retailers(id) on delete restrict,
  current_price numeric(12,2) check (current_price >= 0),
  previous_price numeric(12,2) check (previous_price >= 0),
  availability offer_availability not null default 'unknown',
  product_url text not null,
  affiliate_url text,
  updated_at timestamptz not null default now(),
  unique(product_id, retailer_id, product_url)
);

create table if not exists public.price_history_v2 (
  id uuid primary key default gen_random_uuid(),
  product_offer_id uuid not null references public.product_offers(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  recorded_at timestamptz not null default now()
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products_v2(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.alerts_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products_v2(id) on delete cascade,
  target_price numeric(12,2) not null check (target_price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  triggered_at timestamptz,
  last_notification_at timestamptz
);

create table if not exists public.tracking_jobs (
  id uuid primary key default gen_random_uuid(),
  product_offer_id uuid not null references public.product_offers(id) on delete cascade,
  last_checked_at timestamptz,
  next_check_at timestamptz not null default now(),
  status tracking_job_status not null default 'queued',
  error_count integer not null default 0 check (error_count >= 0),
  last_error text,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_v2_slug on public.products_v2(slug);
create index if not exists idx_products_v2_category_active on public.products_v2(category, active);
create index if not exists idx_product_offers_product_id on public.product_offers(product_id);
create index if not exists idx_product_offers_retailer_id on public.product_offers(retailer_id);
create index if not exists idx_product_offers_updated_at on public.product_offers(updated_at desc);
create index if not exists idx_price_history_v2_offer_recorded on public.price_history_v2(product_offer_id, recorded_at desc);
create index if not exists idx_price_history_v2_recorded_at on public.price_history_v2(recorded_at desc);
create index if not exists idx_watchlists_user_created on public.watchlists(user_id, created_at desc);
create index if not exists idx_alerts_v2_user_active on public.alerts_v2(user_id, active, created_at desc);
create index if not exists idx_alerts_v2_product_active on public.alerts_v2(product_id, active);
create index if not exists idx_tracking_jobs_next_check on public.tracking_jobs(status, next_check_at);
create index if not exists idx_tracking_jobs_offer on public.tracking_jobs(product_offer_id);
create index if not exists idx_notifications_user_read_created on public.notifications(user_id, read, created_at desc);

alter table public.users enable row level security;
alter table public.watchlists enable row level security;
alter table public.alerts_v2 enable row level security;
alter table public.notifications enable row level security;
alter table public.products_v2 enable row level security;
alter table public.retailers enable row level security;
alter table public.product_offers enable row level security;
alter table public.price_history_v2 enable row level security;
alter table public.tracking_jobs enable row level security;

create policy if not exists users_select_own on public.users for select using (auth.uid() = id);
create policy if not exists users_update_own on public.users for update using (auth.uid() = id);
create policy if not exists watchlists_crud_own on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists alerts_v2_crud_own on public.alerts_v2 for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists notifications_crud_own on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists products_v2_public_read on public.products_v2 for select using (active = true);
create policy if not exists retailers_public_read on public.retailers for select using (active = true);
create policy if not exists product_offers_public_read on public.product_offers for select using (true);
create policy if not exists price_history_v2_public_read on public.price_history_v2 for select using (true);
