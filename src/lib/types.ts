export type Roast = "light" | "medium" | "dark";
export type Process = "washed" | "natural" | "honey" | "blend";
export type Size = "250g" | "1kg";
export type Grind = "whole" | "espresso" | "moka" | "filter" | "cafetiere";
export type Pattern = "waves" | "hills" | "sun" | "dots" | "stripes" | "moon";
export type Every = 2 | 4;

export type Product = {
  id: string;
  slug: string;
  name: string;
  origin: string;
  region: string;
  process: Process;
  roast: Roast;
  /** 1 (lightest) to 5 (darkest) */
  roastLevel: number;
  altitude: string;
  varietal: string;
  notes: string[];
  /** tags used by the coffee finder: chocolate, fruit, floral, caramel */
  flavour: Array<"chocolate" | "fruit" | "floral" | "caramel">;
  bestFor: Grind[];
  tagline: string;
  description: string;
  /** prices in pence */
  price250: number;
  price1kg: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  decaf: boolean;
  art: { bag: string; label: string; ink: string; accent: string; pattern: Pattern };
  active: boolean;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  size: Size;
  grind: Grind;
  qty: number;
  every?: Every;
};

export type ShippingMethod = "standard" | "express";

export type DiscountCode = {
  code: string;
  kind: "percent" | "amount" | "shipping";
  /** percent (10 = 10%) or pence */
  value: number;
  minSubtotal: number;
  active: boolean;
  description: string;
};

export type OrderStatus = "pending" | "paid" | "roasting" | "shipped" | "delivered" | "cancelled";

export type OrderLine = {
  productId: string;
  name: string;
  size: Size;
  grind: Grind;
  qty: number;
  unitPrice: number;
  every?: Every;
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
};

export type Order = {
  id: string;
  number: number;
  createdAt: string;
  email: string;
  name: string;
  address: Address | null;
  shippingMethod: ShippingMethod;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  code: string | null;
  status: OrderStatus;
};
