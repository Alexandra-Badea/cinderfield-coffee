-- Cinderfield Coffee: schema, security rules and helpers
-- Money is stored in pence (integers). Row Level Security is on for every table.

-- ---------- Products ----------
create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  origin text not null,
  region text not null default '',
  process text not null check (process in ('washed', 'natural', 'honey', 'blend')),
  roast text not null check (roast in ('light', 'medium', 'dark')),
  roast_level int not null check (roast_level between 1 and 5),
  altitude text not null default '',
  varietal text not null default '',
  notes text[] not null default '{}',
  flavour text[] not null default '{}',
  best_for text[] not null default '{}',
  tagline text not null default '',
  description text not null default '',
  price_250 int not null check (price_250 > 0),
  price_1kg int not null check (price_1kg > 0),
  stock int not null default 0 check (stock >= 0),
  featured boolean not null default false,
  is_new boolean not null default false,
  decaf boolean not null default false,
  art jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ---------- Profiles: one per account, created automatically on sign-up ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Reviews ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products on delete cascade,
  user_id uuid references auth.users on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 800),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id);

-- ---------- Discount codes (never readable by the public) ----------
create table public.discount_codes (
  code text primary key check (code = upper(code) and char_length(code) between 3 and 24),
  kind text not null check (kind in ('percent', 'amount', 'shipping')),
  value int not null default 0 check (value >= 0),
  min_subtotal int not null default 0 check (min_subtotal >= 0),
  active boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null unique default nextval('public.order_number_seq'),
  user_id uuid references auth.users on delete set null,
  email text,
  name text,
  address jsonb,
  shipping_method text not null check (shipping_method in ('standard', 'express')),
  subtotal int not null check (subtotal >= 0),
  discount int not null default 0 check (discount >= 0),
  shipping int not null check (shipping >= 0),
  total int not null check (total >= 0),
  code text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'roasting', 'shipped', 'delivered', 'cancelled')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  stripe_subscription text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_user_idx on public.orders (user_id);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders on delete cascade,
  product_id text references public.products on delete set null,
  name text not null,
  size text not null check (size in ('250g', '1kg')),
  grind text not null check (grind in ('whole', 'espresso', 'moka', 'filter', 'cafetiere')),
  qty int not null check (qty > 0),
  unit_price int not null check (unit_price >= 0),
  every int check (every in (2, 4))
);
create index order_items_order_idx on public.order_items (order_id);

-- Takes an order's bags out of stock. Called once by the Stripe webhook (service role only).
create function public.take_stock(p_order uuid) returns void
language sql security definer set search_path = '' as $$
  update public.products p
  set stock = greatest(0, p.stock - i.total)
  from (select product_id, sum(qty) as total from public.order_items where order_id = p_order group by product_id) i
  where p.id = i.product_id;
$$;
revoke execute on function public.take_stock(uuid) from public, anon, authenticated;

-- ---------- Newsletter ----------
create table public.newsletter (
  email text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter enable row level security;

-- Products: everyone sees active ones; admins see and change everything
create policy "Active products are public" on public.products for select using (active or public.is_admin());
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: you see your own; admins see all. You can change your name, never your role.
create policy "See own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "Update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Reviews: public to read; signed-in customers write their own
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Customers add their own reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "Delete own reviews, or admin" on public.reviews for delete using (user_id = auth.uid() or public.is_admin());

-- Discount codes: admins only (checkout checks codes on the server with the service role)
create policy "Admins manage codes" on public.discount_codes for all using (public.is_admin()) with check (public.is_admin());

-- Orders: customers see their own; admins see and update all. Orders are created by the server.
create policy "See own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "Admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "See items of visible orders" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- Newsletter: anyone can join; only admins can read the list
create policy "Anyone can subscribe" on public.newsletter for insert to anon, authenticated with check (true);
create policy "Admins read subscribers" on public.newsletter for select using (public.is_admin());
