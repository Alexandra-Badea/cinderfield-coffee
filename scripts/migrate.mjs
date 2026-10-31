// Sets up and updates the database on every build, so a new deployment needs no manual SQL.
//
// - Applies each file in supabase/migrations once, in order, and records it in public.schema_migrations.
// - Loads the starting catalogue and discount codes (supabase/seed.sql) into an empty shop.
// - Loads sample reviews only when SEED_SAMPLE_REVIEWS=true (for a demo store, never a real one).
//
// It does nothing when there's no database address, so the shop still builds without Supabase.
// Everything runs in one transaction behind a lock: two builds at once can't apply the same migration twice,
// and a migration that fails leaves the database as it was (and fails the build, loudly).
//
// Run it by hand with: npm run db:migrate

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

/** @param {import("postgres").Sql} sql */
export async function migrate(sql, { sampleReviews = false, log = console.log } = {}) {
  const files = readdirSync(new URL("supabase/migrations/", root))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext('cinderfield:migrate'))`;
    await tx.unsafe(`
      create table if not exists public.schema_migrations (version text primary key, applied_at timestamptz not null default now());
      alter table public.schema_migrations enable row level security;
      revoke all on public.schema_migrations from anon, authenticated;
    `);
    const done = new Set((await tx`select version from public.schema_migrations`).map((r) => r.version));

    // A database set up by hand from the first migration (before this script existed): count it as applied
    if (done.size === 0 && (await tx`select to_regclass('public.products') as t`)[0].t) {
      await tx`insert into public.schema_migrations (version) values (${files[0]})`;
      done.add(files[0]);
      log(`  ${files[0]} was already applied by hand`);
    }

    for (const file of files) {
      if (done.has(file)) continue;
      await tx.unsafe(read(`supabase/migrations/${file}`));
      await tx`insert into public.schema_migrations (version) values (${file})`;
      log(`  applied ${file}`);
    }

    const [{ n: products }] = await tx`select count(*)::int as n from public.products`;
    if (products === 0) {
      await tx.unsafe(read("supabase/seed.sql"));
      log("  added the starting coffees and discount codes");
    }
    if (sampleReviews) {
      const [{ n: reviews }] = await tx`select count(*)::int as n from public.reviews`;
      if (reviews === 0) {
        await tx.unsafe(read("supabase/seed-sample-reviews.sql"));
        log("  added the sample reviews");
      }
    }
  });
}

async function main() {
  if (existsSync(new URL(".env.local", root))) process.loadEnvFile(new URL(".env.local", root));
  // The Vercel Supabase integration provides POSTGRES_URL_NON_POOLING (best for schema changes) and POSTGRES_URL
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.log("Database: no POSTGRES_URL set, skipping migrations.");
    return;
  }
  console.log("Database: checking migrations…");
  // prepare: false works through Supabase's connection pooler too
  const sql = postgres(url, { max: 1, prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require", onnotice: () => {} });
  try {
    await migrate(sql, { sampleReviews: process.env.SEED_SAMPLE_REVIEWS === "true" });
    console.log("Database: up to date.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`Database: migration failed. ${err.message}`);
    process.exit(1);
  });
}
