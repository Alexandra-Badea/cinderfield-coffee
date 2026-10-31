import type { DiscountCode, Review } from "@/lib/types";

/** Sample reviews, shown when no database is connected. The database only gets them if SEED_SAMPLE_REVIEWS is set (see scripts/migrate.mjs). */
export const reviews: Review[] = [
  { id: "r1", productId: "p-morning-field", author: "Hannah", rating: 5, body: "Our everyday coffee now. Lovely in a flat white and still good when I forget it in the cafetière.", createdAt: "2026-09-28" },
  { id: "r2", productId: "p-morning-field", author: "Tom", rating: 4, body: "Smooth and sweet. I'd like it a touch stronger for espresso, but as filter it's spot on.", createdAt: "2026-09-12" },
  { id: "r3", productId: "p-morning-field", author: "Priya", rating: 5, body: "Arrived two days after roasting. You can smell the difference when you open the bag.", createdAt: "2026-08-30" },
  { id: "r4", productId: "p-night-shift", author: "Marcus", rating: 5, body: "Proper heavy espresso. Cuts through oat milk, which most coffees don't.", createdAt: "2026-10-02" },
  { id: "r5", productId: "p-night-shift", author: "Ella", rating: 4, body: "Big chocolate, a bit of smoke. Exactly what I wanted for my moka pot.", createdAt: "2026-09-19" },
  { id: "r6", productId: "p-pink-bourbon", author: "Jonah", rating: 5, body: "Tastes like grapes, I'm not joking. Brewed as V60 it's the best coffee I've had at home.", createdAt: "2026-10-09" },
  { id: "r7", productId: "p-pink-bourbon", author: "Sofia", rating: 5, body: "Floral and sweet, and the rose really comes through as it cools.", createdAt: "2026-09-25" },
  { id: "r8", productId: "p-konga", author: "Liam", rating: 5, body: "Like jasmine tea. Very delicate, needs a light hand when brewing.", createdAt: "2026-09-07" },
  { id: "r9", productId: "p-konga", author: "Grace", rating: 4, body: "Lovely lemon notes. Too light for me with milk, perfect black.", createdAt: "2026-08-21" },
  { id: "r10", productId: "p-guji", author: "Noah", rating: 5, body: "Blueberry muffin in a cup. My partner who 'doesn't like fruity coffee' finished the bag.", createdAt: "2026-10-05" },
  { id: "r11", productId: "p-guji", author: "Amira", rating: 5, body: "Wild as espresso, beautiful as filter. Order before it sells out.", createdAt: "2026-09-16" },
  { id: "r12", productId: "p-guji", author: "Ben", rating: 4, body: "Big jammy fruit. A bit much for every day but a real treat.", createdAt: "2026-09-01" },
  { id: "r13", productId: "p-cerrado", author: "Chloe", rating: 5, body: "Chocolate biscuit is exactly right. My go-to for lattes.", createdAt: "2026-09-22" },
  { id: "r14", productId: "p-kirinyaga", author: "Oscar", rating: 5, body: "Blackcurrant and grapefruit, so juicy. Kenyan coffee at its best.", createdAt: "2026-10-11" },
  { id: "r15", productId: "p-huehue", author: "Maya", rating: 5, body: "Chocolate orange! Works in everything I own: espresso, Aeropress and cafetière.", createdAt: "2026-09-29" },
  { id: "r16", productId: "p-huehue", author: "Daniel", rating: 4, body: "Balanced and sweet. A safe pick for guests who like 'normal' coffee.", createdAt: "2026-09-03" },
  { id: "r17", productId: "p-decaf", author: "Ruth", rating: 5, body: "I can have coffee after dinner again and it actually tastes of something.", createdAt: "2026-10-04" },
  { id: "r18", productId: "p-decaf", author: "Sam", rating: 4, body: "Nobody at work guessed it was decaf.", createdAt: "2026-09-14" },
];

/** Starting discount codes. With Supabase connected they live in the discount_codes table. */
export const discountCodes: DiscountCode[] = [
  { code: "WELCOME10", kind: "percent", value: 10, minSubtotal: 0, active: true, description: "10% off your first order" },
  { code: "FREESHIP", kind: "shipping", value: 0, minSubtotal: 1500, active: true, description: "Free standard delivery over £15" },
  { code: "BREW5", kind: "amount", value: 500, minSubtotal: 3000, active: true, description: "£5 off orders over £30" },
  { code: "SUMMER25", kind: "percent", value: 25, minSubtotal: 0, active: false, description: "Summer sale (expired)" },
];
