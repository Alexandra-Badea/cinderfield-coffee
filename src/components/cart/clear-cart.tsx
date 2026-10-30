"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

/** Empties the bag once, after a successful payment */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
