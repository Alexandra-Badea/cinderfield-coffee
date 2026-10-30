# Cinderfield Coffee Roasters

A complete online shop for a small-batch coffee roaster: catalogue, bag, checkout, subscriptions, customer accounts and an admin for the owner. Built with Next.js, Supabase and Stripe.

![The Cinderfield home page](docs/screenshots/home.webp)

> **Cinderfield isn't a real business.** The coffees, prices, reviews and customers are made up. I built it as a portfolio project to show what a small business shop can look like when it's done properly, from the first click to the owner's dashboard. Checkout never takes real money: it runs without payment in demo mode and on Stripe's test mode in live mode.
>
> Alexandra Badea · [Pages by Alexa](https://pagesbyalexa.com)

## What's in it

**For customers**

- Shop with search, filters (roast, type, flavour) and sorting. Filters live in the URL, so a filtered page can be shared or bookmarked.
- Product pages with tasting notes, origin details, a brew recipe for that coffee, reviews and structured data for search engines.
- A slide-out bag that's saved between visits, shows how far you are from free delivery and syncs across tabs.
- Discount codes: percentage off, fixed amount off, free delivery, with optional minimum spend. Try `WELCOME10`.
- Subscriptions every 2 or 4 weeks at 10% off with free delivery, and a subscription builder that shows the price per delivery, per month and what it saves in a year.
- A coffee finder quiz: four questions score every coffee in stock and explain why the match fits. Results have their own URL.
- Brew guides with a coffee-to-water calculator and a "fix my coffee" section.
- Accounts with order history.

**For the owner** (`/admin`)

- Dashboard: sales over 30 days, average order, how many bags to roast on Tuesday, best sellers and low stock.
- Orders that move from paid to roasting, shipped and delivered, with search and status filters.
- Edit prices and stock, feature a coffee on the home page or take it off sale. The shop updates immediately.
- Create discount codes and switch them off.

**Under the hood**

- The server re-prices every order from the database. The browser sends what's in the bag, never what it costs.
- Row Level Security on every table: customers can only read their own orders, and only admins can change products, orders and codes. The admin pages are locked by the database, not just hidden.
- The Stripe webhook verifies the signature, marks the order paid, saves the delivery address and takes the bags out of stock. It's safe to receive twice.
- Pages are prerendered and the catalogue is cached, then refreshed the moment an admin saves a change.
- Accessible: real buttons and form labels, visible focus, a skip link, keyboard-friendly quiz and drawer, and no animation for people who've turned motion off.
- Tests for pricing and discounts, the coffee finder, and every database security rule (run against real Postgres in memory with PGlite).

## Screenshots

| | |
|---|---|
| ![Shop with filters](docs/screenshots/shop.webp) | ![Product page](docs/screenshots/product.webp) |
| ![The bag](docs/screenshots/bag.webp) | ![Coffee finder result](docs/screenshots/finder.webp) |
| ![Subscription builder](docs/screenshots/subscriptions.webp) | ![Admin dashboard](docs/screenshots/admin.webp) |

![Orders in the admin](docs/screenshots/admin-orders.webp)

![On a phone](docs/screenshots/mobile.webp)

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Row Level Security) · Stripe Checkout and webhooks · Vitest and PGlite · Vercel

## Running it

You need Node 20 or newer.

### Demo mode: no setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no keys, the shop runs on the catalogue in `src/data`, orders and admin changes are kept in your browser's local storage, and checkout goes straight to a confirmation without payment. This is also how the public preview runs, so nobody can break it for anyone else.

### Live mode: Supabase and Stripe (test mode)

1. **Create a Supabase project.** In the SQL editor, run `supabase/migrations/20261030120000_init.sql`, then `supabase/seed.sql` to add the coffees, sample reviews and discount codes.
2. **Set up auth.** In Authentication → URL Configuration, set the Site URL to your site (e.g. `http://localhost:3000`) and add `http://localhost:3000/auth/callback` to the redirect URLs.
3. **Get Stripe test keys** from the Stripe dashboard (Developers → API keys, with test mode on).
4. **Copy the environment file** and fill it in:

   ```bash
   cp .env.example .env.local
   ```

5. **Forward Stripe webhooks** to your machine with the [Stripe CLI](https://docs.stripe.com/stripe-cli). It prints the webhook signing secret (`whsec_…`) for `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   When deployed, add an endpoint in the Stripe dashboard pointing to `https://your-site/api/stripe/webhook` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.expired`.

6. **Run it**, sign up on `/account`, and pay with the test card `4242 4242 4242 4242` (any future date, any CVC).
7. **Make yourself an admin** in the SQL editor:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Live mode switches on when all of the Supabase and Stripe variables are set. With only Supabase set, accounts and reviews work but checkout stays in demo mode.

### Deploying

Import the repository on Vercel and add the same environment variables. `NEXT_PUBLIC_SITE_URL` is optional there: the site address is picked up from Vercel. With no variables at all, it deploys in demo mode.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Run the tests (pricing, coffee finder, database security rules) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, without building |
| `npm run db:seed-file` | Rebuild `supabase/seed.sql` from the catalogue in `src/data` |

## Where things are

```
src/
  app/                  pages and routes
    admin/              the owner's dashboard, orders, products and codes (+ server actions)
    api/checkout/       prices the bag on the server and starts Stripe Checkout
    api/stripe/webhook/ confirms payment and takes stock
  components/           UI, including the cart, quiz and admin tables
  data/                 the demo catalogue, reviews and discount codes
  lib/
    pricing.ts          every price, discount and delivery rule, in one place
    checkout.ts         checks a bag against the catalogue and stock
    catalog.ts          reads products and reviews (cached), from Supabase or src/data
    finder.ts           the coffee finder's scoring
    browser-store.ts    local storage for the bag and demo data, without effects
  proxy.ts              keeps the Supabase session fresh
supabase/
  migrations/           tables, security rules and the stock function
  tests/                tests for every security rule, on an in-memory Postgres
```

## A few decisions

- **Prices are in pence**, as integers, everywhere. No floating-point pennies.
- **One pricing module** (`src/lib/pricing.ts`) is used by the bag, the checkout API and the admin, so the number a customer sees is the number they're charged.
- **Demo mode is a first-class mode**, not a mock: the same components and pricing run in both. It means the shop can be shown publicly without accounts, keys or a database bill.
- **The bags are drawn in code** (SVG) instead of photographed. It keeps the demo light and lets a new coffee get its own bag with a few colours.

## Not built yet

- Emails (order confirmations, roast reminders). They'd go through a service like Resend, from the same webhook.
- Renewal orders for subscriptions: Stripe bills each renewal, but the shop doesn't yet turn Stripe's `invoice.paid` event into a new order to roast.
- A page for customers to skip or change a subscription. Stripe's customer portal would cover most of it.

## Licence

MIT. The fonts (Fraunces and Instrument Sans) are under the SIL Open Font License; see `src/fonts/OFL.txt`.
