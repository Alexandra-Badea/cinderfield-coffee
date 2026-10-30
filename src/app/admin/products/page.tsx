import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { ProductsTable } from "@/components/admin/products-table";
import { loadAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Products" };

export default function AdminProducts() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await loadAdmin();
  if (!data.ok) return <AdminGate data={data} />;
  return (
    <>
      <p className="mb-4 text-roast">Change prices and stock, feature a coffee on the home page, or take it off sale. The shop updates straight away.</p>
      <ProductsTable live={data.live} products={data.products} />
    </>
  );
}
