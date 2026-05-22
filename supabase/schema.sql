create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.merchants (
  id text primary key,
  name text not null,
  slug text unique not null,
  category text not null default 'kuliner' check (category in ('kuliner', 'fashion', 'jasa', 'lainnya')),
  description text not null default '',
  owner_name text not null default '',
  phone text not null default '',
  whatsapp_number text not null default '',
  address text not null default '',
  city text not null default 'Purbalingga',
  opening_hours text not null default '',
  is_premium boolean not null default false,
  status text not null default 'active' check (status in ('active', 'draft', 'suspended')),
  ai_tone text not null default 'ramah' check (ai_tone in ('ramah', 'formal', 'santai')),
  fallback_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  merchant_id text not null references public.merchants(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  stock_status text not null default 'ready' check (stock_status in ('ready', 'limited', 'empty')),
  category text not null default 'umum',
  image_url text,
  keywords text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null references public.merchants(id) on delete cascade,
  customer_phone text not null,
  customer_name text,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'mock', 'openclaw')),
  last_message text not null default '',
  last_intent text not null default 'lainnya' check (last_intent in ('tanya_produk', 'pesan', 'komplain', 'lokasi', 'jam_buka', 'lainnya')),
  status text not null default 'open' check (status in ('open', 'handled', 'needs_human')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null references public.merchants(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender text not null check (sender in ('customer', 'bot', 'human')),
  text text not null default '',
  raw_payload jsonb,
  intent text,
  ai_response_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null references public.merchants(id) on delete cascade,
  chat_id text not null default '',
  customer_phone text not null default '',
  customer_name text,
  items jsonb not null default '[]'::jsonb,
  total_estimated numeric not null default 0,
  delivery_method text not null default 'unknown' check (delivery_method in ('pickup', 'delivery', 'unknown')),
  address text,
  note text,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'processing', 'done', 'cancelled')),
  source_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_daily (
  id text primary key,
  merchant_id text not null references public.merchants(id) on delete cascade,
  date text not null,
  total_chats integer not null default 0,
  total_orders integer not null default 0,
  top_asked_products jsonb not null default '[]'::jsonb,
  top_ordered_products jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.openclaw_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  merchant_id text not null,
  chat_id text,
  customer_phone text,
  summary text,
  priority text,
  date text,
  action text,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);

create index if not exists products_merchant_id_idx on public.products(merchant_id);
create index if not exists chats_merchant_updated_idx on public.chats(merchant_id, updated_at desc);
create index if not exists chats_customer_idx on public.chats(merchant_id, customer_phone);
create index if not exists messages_chat_created_idx on public.messages(chat_id, created_at asc);
create index if not exists orders_merchant_created_idx on public.orders(merchant_id, created_at desc);
create index if not exists analytics_daily_merchant_date_idx on public.analytics_daily(merchant_id, date);
create index if not exists openclaw_events_merchant_received_idx on public.openclaw_events(merchant_id, received_at desc);

drop trigger if exists merchants_set_updated_at on public.merchants;
create trigger merchants_set_updated_at
before update on public.merchants
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists chats_set_updated_at on public.chats;
create trigger chats_set_updated_at
before update on public.chats
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists analytics_daily_set_updated_at on public.analytics_daily;
create trigger analytics_daily_set_updated_at
before update on public.analytics_daily
for each row execute function public.set_updated_at();

-- MVP mode: the app can run with the publishable key only.
-- Before a public production launch, set SUPABASE_SERVICE_ROLE_KEY on the server and replace this with RLS policies.
alter table public.merchants disable row level security;
alter table public.products disable row level security;
alter table public.chats disable row level security;
alter table public.messages disable row level security;
alter table public.orders disable row level security;
alter table public.analytics_daily disable row level security;
alter table public.openclaw_events disable row level security;
