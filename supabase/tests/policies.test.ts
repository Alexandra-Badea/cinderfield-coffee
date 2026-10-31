// Runs the real migrations and seed in an in-memory Postgres (PGlite), then checks who can see and change what.
import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const dir = new URL("..", import.meta.url);
const db = new PGlite();
let ann = "", bea = "", annOrder = "";

const rows = async <T = Record<string, unknown>>(sql: string) => (await db.query<T>(sql)).rows;
const count = async (sql: string) => (await rows<{ n: number }>(`select count(*)::int as n from (${sql}) q`))[0].n;
async function as(role: "anon" | "authenticated" | "service", uid = "") {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  if (role !== "service") await db.exec(`set role ${role}`);
}

beforeAll(async () => {
  // a small stand-in for Supabase: roles, the auth schema and the default grants
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  for (const file of readdirSync(new URL("migrations/", dir)).sort()) await db.exec(readFileSync(new URL(`migrations/${file}`, dir), "utf8"));
  await db.exec(readFileSync(new URL("seed.sql", dir), "utf8"));
  await db.exec(readFileSync(new URL("seed-sample-reviews.sql", dir), "utf8"));

  ann = (await rows<{ id: string }>(`insert into auth.users (email, raw_user_meta_data) values ('ann@example.com', '{"full_name":"Ann"}') returning id`))[0].id;
  bea = (await rows<{ id: string }>(`insert into auth.users (email) values ('bea@example.com') returning id`))[0].id;
  await db.exec(`update public.profiles set role = 'admin' where id = '${bea}'`);
  await db.exec(`insert into public.orders (user_id, email, shipping_method, subtotal, shipping, total, status) values
    ('${ann}', 'ann@example.com', 'standard', 2600, 395, 2995, 'paid'), (null, 'guest@example.com', 'standard', 3500, 0, 3500, 'pending')`);
  annOrder = (await rows<{ id: string }>(`select id from public.orders where user_id = '${ann}'`))[0].id;
  await db.exec(`insert into public.order_items (order_id, product_id, name, size, grind, qty, unit_price) values ('${annOrder}', 'p-guji', 'Guji Natural', '250g', 'filter', 2, 1300)`);
});

describe("signing up", () => {
  it("creates a customer profile for each new account", async () => {
    expect(await count("select * from public.profiles where role = 'customer'")).toBe(1);
  });
});

describe("a visitor (not signed in)", () => {
  beforeAll(() => as("anon"));
  it("sees the active coffees", async () => expect(await count("select * from public.products")).toBe(9));
  it("can't list discount codes, orders or newsletter emails", async () => {
    expect(await count("select * from public.discount_codes")).toBe(0);
    expect(await count("select * from public.orders")).toBe(0);
    expect(await count("select * from public.newsletter")).toBe(0);
  });
  it("can join the newsletter", async () => {
    await expect(db.exec("insert into public.newsletter (email) values ('new@example.com')")).resolves.toBeDefined();
  });
  it("can't change prices", async () => {
    await db.exec("update public.products set price_250 = 1");
    expect((await rows<{ price_250: number }>("select price_250 from public.products where id = 'p-guji'"))[0].price_250).toBe(1300);
  });
});

describe("a signed-in customer", () => {
  beforeAll(() => as("authenticated", ann));
  it("sees only their own orders and items", async () => {
    expect(await count("select * from public.orders")).toBe(1);
    expect(await count("select * from public.order_items")).toBe(1);
  });
  it("can review as themselves, but not as someone else", async () => {
    await db.exec(`insert into public.reviews (product_id, user_id, author_name, rating, body) values ('p-guji', '${ann}', 'Ann', 5, 'Lovely blueberry notes.')`);
    await expect(db.exec(`insert into public.reviews (product_id, user_id, author_name, rating, body) values ('p-konga', '${bea}', 'Bea', 1, 'Pretending to be Bea.')`)).rejects.toThrow();
  });
  it("can change their name but not make themselves an admin", async () => {
    await db.exec(`update public.profiles set full_name = 'Ann C' where id = '${ann}'`);
    await expect(db.exec(`update public.profiles set role = 'admin' where id = '${ann}'`)).rejects.toThrow();
  });
  it("can't change an order's status or take stock", async () => {
    await db.exec("update public.orders set status = 'delivered'");
    expect((await rows<{ status: string }>(`select status from public.orders where id = '${annOrder}'`))[0].status).toBe("paid");
    await expect(db.exec(`select public.take_stock('${annOrder}')`)).rejects.toThrow();
  });
});

describe("an admin", () => {
  beforeAll(() => as("authenticated", bea));
  it("sees every order and the discount codes", async () => {
    expect(await count("select * from public.orders")).toBe(2);
    expect(await count("select * from public.discount_codes")).toBe(4);
  });
  it("can update orders and products", async () => {
    await db.exec(`update public.orders set status = 'shipped' where id = '${annOrder}'`);
    await db.exec("update public.products set stock = 20 where id = 'p-guji'");
    expect((await rows<{ status: string }>(`select status from public.orders where id = '${annOrder}'`))[0].status).toBe("shipped");
  });
});

describe("the server", () => {
  beforeAll(() => as("service"));
  it("takes paid bags out of stock", async () => {
    await db.exec(`select public.take_stock('${annOrder}')`);
    expect((await rows<{ stock: number }>("select stock from public.products where id = 'p-guji'"))[0].stock).toBe(18);
  });
  it("numbers orders from 1001", async () => {
    expect((await rows<{ number: number }>("select min(number) as number from public.orders"))[0].number).toBe(1001);
  });
});
