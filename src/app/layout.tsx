import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider, type CartProduct } from "@/components/cart/cart-provider";
import { DemoBanner } from "@/components/demo-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getProducts } from "@/lib/catalog";
import { siteUrl, takesRealPayments } from "@/lib/config";
import "./globals.css";

// Bricolage Grotesque (headings, with width and optical-size axes), Instrument Serif (italic accents), Instrument Sans (text)
const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin-standard-normal.woff2",
  weight: "200 800",
  variable: "--font-bricolage",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const serif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  // only used for the odd italic word, so it needn't hold up the first paint
  preload: false,
});

const instrument = localFont({
  src: "../fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Cinderfield Coffee Roasters | Fresh speciality coffee, roasted every Tuesday", template: "%s | Cinderfield Coffee" },
  description:
    "Small-batch speciality coffee, roasted every Tuesday and posted the next day. Single origins, blends and flexible subscriptions.",
  openGraph: { type: "website", siteName: "Cinderfield Coffee Roasters", locale: "en_GB" },
  // a store that can't take real payments yet stays out of search results
  robots: takesRealPayments ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f4f1ec" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog: CartProduct[] = (await getProducts()).map(({ id, slug, name, origin, price250, price1kg, stock, roastLevel, art, decaf }) => ({
    id, slug, name, origin, price250, price1kg, stock, roastLevel, art, decaf,
  }));
  return (
    <html lang="en-GB" className={`${bricolage.variable} ${serif.variable} ${instrument.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        <CartProvider catalog={catalog}>
          <DemoBanner />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
