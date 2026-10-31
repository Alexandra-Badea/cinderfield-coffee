import "server-only";
import { stripe } from "./stripe";

export type SubscriptionSummary = {
  id: string;
  status: "active" | "attention" | "paused" | "ended";
  statusLabel: string;
  items: string[];
  every: number | null;
  /** when the next delivery is charged, or when a cancelled subscription ends */
  date: string | null;
  cancelling: boolean;
};

const labels: Record<string, [SubscriptionSummary["status"], string]> = {
  active: ["active", "Active"],
  trialing: ["active", "Active"],
  past_due: ["attention", "Payment failed: please update your card"],
  unpaid: ["attention", "Payment failed: please update your card"],
  incomplete: ["attention", "Waiting for payment"],
  paused: ["paused", "Paused"],
  canceled: ["ended", "Cancelled"],
};

/** A customer's subscriptions, straight from Stripe, ready to show on the account page */
export async function listSubscriptions(customer: string): Promise<SubscriptionSummary[]> {
  try {
    const list = await stripe().subscriptions.list({ customer, status: "all", limit: 10, expand: ["data.items.data.price.product"] });
    return list.data
      .filter((s) => s.status !== "incomplete_expired")
      .map((s) => {
        const first = s.items.data[0];
        const periodEnd = first?.current_period_end;
        const cancelling = s.cancel_at_period_end || Boolean(s.cancel_at);
        const [status, statusLabel] = labels[s.status] ?? ["attention", s.status];
        return {
          id: s.id,
          status,
          statusLabel: cancelling && status === "active" ? "Ending soon" : statusLabel,
          items: s.items.data.map((i) => {
            const p = i.price.product;
            const name = typeof p === "object" && !("deleted" in p && p.deleted) && "name" in p ? p.name : "Coffee";
            return (i.quantity ?? 1) > 1 ? `${i.quantity} × ${name}` : name;
          }),
          every: first?.price.recurring?.interval_count ?? null,
          date: status !== "ended" && periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancelling,
        };
      });
  } catch {
    return []; // Stripe unreachable: the page still shows orders
  }
}
