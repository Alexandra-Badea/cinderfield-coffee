-- Accounts and subscriptions: link customers to Stripe, and record each subscription renewal as its own order.

-- The customer's Stripe id, so their next checkout and the subscription page know who they are.
-- Customers can only ever change their own name (see the grant in the first migration), never this.
alter table public.profiles add column stripe_customer_id text unique;

-- Each paid renewal invoice becomes one order; the unique invoice id stops Stripe's retries creating duplicates.
alter table public.orders add column stripe_invoice text unique;
create index orders_subscription_idx on public.orders (stripe_subscription);
