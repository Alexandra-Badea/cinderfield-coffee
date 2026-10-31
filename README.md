# Cinderfield Coffee Roasters

A complete online shop for a small-batch coffee roaster: catalogue, bag, checkout, subscriptions, customer accounts and an admin for the owner. Built with Next.js, Supabase and Stripe, and ready to hand over to a real roastery.

![The Cinderfield home page](docs/screenshots/home.webp)

> Cinderfield is a sample brand: the coffees, prices and sample reviews are placeholders for the roaster's own. Until live Stripe keys are added, the site shows a one-line "demo store" notice with the Stripe test card, keeps itself out of search engines, and no real money changes hands.
>
> Built by Alexandra Badea · [Pages by Alexa](https://pagesbyalexa.com)

## What's in it

**For customers**

- Shop with search, filters (roast, type, flavour) and sorting. Filters live in the URL, so a filtered page can be shared or bookmarked.
- A 3D home page: the week's coffees as bags you can spin with a finger or a mouse, among drifting beans and embers. Click a bag to open its page.
- Product pages with a 3D bag to turn, tasting notes, origin details, a brew recipe for that coffee, reviews and structured data for search engines. On a phone, an "Add to bag" bar follows you down the page.
- A slide-out bag that's saved between visits, shows how far you are from free delivery and syncs across tabs.
- Discount codes: percentage off, fixed amount off, free delivery, with optional minimum spend. Try `WELCOME10`.
- Subscriptions every 2 or 4 weeks at 10% off with free delivery, and a subscription builder that shows the price per delivery, per month and what it saves in a year.
- A coffee finder quiz: four questions score every coffee in stock and explain why the match fits. Results have their own URL.
- Brew guides with a coffee-to-water calculator and a "fix my coffee" section.
- Customer accounts: sign up, sign in, forgot/reset password, change name and password, order history, and subscriptions with their next delivery date. "Update card or cancel" opens Stripe's customer portal.
- Emails that look like the shop: an animated welcome for newsletter sign-ups (with one-click unsubscribe), an order confirmation with a picture of each bag, and matching templates for Supabase's account emails (confirm your email, reset password, sign-in link, change email, invite).
- A 404 page with a coffee stirring itself, and an error page that offers to try again.

**For the owner** (`/admin`)

- Dashboard: sales over 30 days, average order, how many bags to roast on Tuesday, best sellers and low stock.
- Orders that move from paid to roasting, shipped and delivered, with search and status filters.
- Edit prices and stock, feature a coffee on the home page or take it off sale. The shop updates immediately.
- Create discount codes and switch them off.

**Under the hood**

- The server re-prices every order from the database. The browser sends what's in the bag, never what it costs.
- Row Level Security on every table: customers can only read their own orders, and only admins can change products, orders and codes. The admin pages are locked by the database, not just hidden.
- Payments are confirmed twice over: the order page checks with Stripe, and the signed Stripe webhook does the same. Either can arrive first and repeats change nothing, so an order is never lost or counted twice.
- Every subscription renewal Stripe charges becomes a new order to roast, with stock taken off.
- The database sets itself up: each build applies any new migrations and loads the starting catalogue into an empty shop.
- Pages are prerendered and the catalogue is cached, then refreshed the moment an admin saves a change.
- Accessible: real buttons and form labels, visible focus, a skip link, keyboard-friendly quiz, drawer and menu, and no animation for people who've turned motion off.
- The 3D is three.js through React Three Fiber, loaded after the page and only where it can run: phones and laptops get a lighter scene, it pauses when scrolled out of view, and anyone with reduced motion, data saver or no WebGL gets the same bags drawn flat, so nothing is ever missing.
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

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · three.js with React Three Fiber · Supabase (Postgres, Auth, Row Level Security) · Stripe Checkout and webhooks · Resend · Vitest and PGlite · Vercel

## Running it

You need Node 20 or newer.

### On your machine

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no keys, the shop runs on the catalogue in `src/data`, orders and admin changes are kept in your browser, and checkout takes no payment. Copy `.env.example` to `.env.local` and fill it in to connect Supabase and Stripe; `npm run db:migrate` then sets up the database.

### Deploying on Vercel, with Supabase and Stripe

1. **Import the repository** on [vercel.com/new](https://vercel.com/new). It deploys straight away, with no database and no payments.
2. **Add Supabase** from the project's Storage tab (Create Database → Supabase). Vercel creates the database and adds its keys to the project. The next build creates the tables and the starting coffees. For a demo store, also add `SEED_SAMPLE_REVIEWS` = `true`.
3. **Add Stripe** from the Vercel Marketplace (or paste your own test keys as `STRIPE_SECRET_KEY`). Checkout now goes through Stripe.
4. **Tell Supabase where the site lives.** In Supabase → Authentication → URL Configuration, set the Site URL to the shop's address and add `https://your-shop.com/**` to the redirect URLs, so confirmation and password-reset links come back to the shop.
5. **Add the Stripe webhook** (recommended): in Stripe → Developers → Webhooks, add `https://your-shop.com/api/stripe/webhook` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired` and `invoice.paid`, then save its signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel. Orders go through without it, but subscription renewals need it.
6. **Turn on Stripe's customer portal** (Stripe → Settings → Billing → Customer portal → Save), so customers can update their card or cancel.
7. **Set up the emails** (see [Emails](#emails) below).
8. **Redeploy**, create your account on the site, and make it an admin in Supabase's SQL editor:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

To try a payment, use the card `4242 4242 4242 4242` with any future date and any CVC.

### Going live for a real shop

- Replace the coffees in `src/data/products.ts` (then `npm run db:seed-file`), or edit them in the admin.
- Don't set `SEED_SAMPLE_REVIEWS`, so the shop starts with real reviews only.
- Set `SHOP_EMAIL` to the shop's address and check the privacy and terms pages against the business.
- Switch on Stripe's emails for successful payments (Stripe → Settings → Customer emails), so customers get a receipt.
- Give Supabase your own email sender (see [Emails](#emails)), since its built-in one only sends to the project's own team.
- Add the live Stripe keys and a live webhook. The demo-store notice and the noindex tag go away on their own.

## Emails

There are two kinds, and both are designed to match the shop: a dark header with an animated pour, cream body, glowing ember button. They are table-based HTML so they hold up in Gmail, Outlook and Apple Mail, and the animation is a GIF, so it plays everywhere that shows images.

**Account emails** are sent by Supabase. Paste each file from `supabase/templates` into Supabase → Authentication → Emails, with its subject:

| Template | File | Subject |
|---|---|---|
| Confirm sign up | `confirmation.html` | Confirm your email for Cinderfield |
| Reset password | `recovery.html` | Choose a new password |
| Magic link | `magic-link.html` | Your sign-in link |
| Change email address | `email-change.html` | Confirm your new email address |
| Invite user | `invite.html` | You've been invited to Cinderfield |

Supabase's built-in sender only delivers to the members of your Supabase team, so for real customers add your own under Authentication → Emails → SMTP Settings. With Resend that's host `smtp.resend.com`, port `465`, user `resend` and your API key as the password.

**Shop emails** (newsletter welcome, order confirmation) are sent through [Resend](https://resend.com) when `RESEND_API_KEY` and `EMAIL_FROM` are set. Verify your domain in Resend first. The images load from the live site's `public/email` folder.

To change the design, edit `src/emails/templates.ts` and run `npm run email:templates`. It rewrites `supabase/templates` and saves previews of every email to `email-previews/`, to open in a browser.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build (sets up the database first, if one is connected) and server |
| `npm run db:migrate` | Apply new migrations and load the starting catalogue |
| `npm test` | Run the tests (pricing, coffee finder, database security rules) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, without building |
| `npm run db:seed-file` | Rebuild `supabase/seed.sql` (and the sample reviews) from `src/data` |
| `npm run email:templates` | Rebuild the Supabase email templates and write email previews |

## Where things are

```
src/
  app/                  pages and routes
    admin/              the owner's dashboard, orders, products and codes (+ server actions)
    api/checkout/       prices the bag on the server and starts Stripe Checkout
    api/stripe/webhook/ confirms payments and records subscription renewals
    account/            sign in, details, subscriptions and orders
  components/           UI, including the cart, quiz and admin tables
    three/              the 3D bags, beans and embers (three.js)
  emails/               every email, as HTML built in code
  data/                 the demo catalogue, reviews and discount codes
  lib/
    pricing.ts          every price, discount and delivery rule, in one place
    checkout.ts         checks a bag against the catalogue and stock
    catalog.ts          reads products and reviews (cached), from Supabase or src/data
    fulfil.ts           marks orders paid, emails the confirmation, turns renewals into orders
    email.ts            sends through Resend and signs unsubscribe links
    finder.ts           the coffee finder's scoring
    browser-store.ts    local storage for the bag and demo data, without effects
  proxy.ts              keeps the Supabase session fresh
scripts/migrate.mjs     sets up and updates the database on every build
supabase/
  migrations/           tables, security rules and the stock function
  templates/            the account emails, to paste into Supabase
  tests/                tests for every security rule, on an in-memory Postgres
```

## A few decisions

- **Prices are in pence**, as integers, everywhere. No floating-point pennies.
- **One pricing module** (`src/lib/pricing.ts`) is used by the bag, the checkout API and the admin, so the number a customer sees is the number they're charged.
- **It runs with or without its services.** With no keys, the same components and pricing run on built-in data, so the shop can be previewed anywhere; Supabase and Stripe switch on as their keys appear.
- **The bags are drawn in code** instead of photographed: the same few colours and a pattern make the flat SVG bag and the label printed on the 3D one, so a new coffee gets its own bag in both without a photo shoot.
- **Motion that's always optional.** Scroll reveals use CSS scroll-driven animations, and everything that moves, 3D included, stands still for people who've asked for less motion.

## Not built yet

- Shipping emails ("your coffee is on its way") when an order is marked shipped in the admin. They'd use the same templates and Resend.
- Gift subscriptions.

## Licence

MIT. The fonts (Bricolage Grotesque, Instrument Serif and Instrument Sans) are under the SIL Open Font License; see `src/fonts/OFL.txt`.
