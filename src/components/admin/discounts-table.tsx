"use client";

import { useState, useTransition } from "react";
import { createCode, setCodeActive } from "@/app/admin/actions";
import { formatGBP } from "@/lib/pricing";
import type { DiscountCode } from "@/lib/types";
import { useAdminCodes, writeSaved } from "./demo-store";

const describe = (c: DiscountCode) => (c.kind === "percent" ? `${c.value}% off` : c.kind === "amount" ? `${formatGBP(c.value)} off` : "Free delivery");
const field = "h-10 w-full rounded-xl border border-line bg-paper px-3 outline-none focus:border-espresso/50";

export function DiscountsTable({ live, codes: initial }: { live: boolean; codes: DiscountCode[] }) {
  const [codes, setCodes] = useAdminCodes(live, initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<DiscountCode["kind"]>("percent");

  function toggle(c: DiscountCode) {
    const active = !c.active;
    setCodes((list) => list.map((x) => (x.code === c.code ? { ...x, active } : x)));
    start(async () => {
      const r = await setCodeActive(c.code, active);
      if (!r.ok) {
        setError(r.error);
        setCodes((list) => list.map((x) => (x.code === c.code ? { ...x, active: !active } : x)));
      } else if (r.demo) writeSaved((s) => ({ ...s, codeActive: { ...s.codeActive, [c.code]: active } }));
    });
  }

  function add(form: FormData) {
    setError(null);
    const raw = Number(form.get("value") || 0);
    const code: DiscountCode = {
      code: String(form.get("code") ?? "").trim().toUpperCase(),
      kind,
      value: kind === "amount" ? Math.round(raw * 100) : kind === "percent" ? Math.round(raw) : 0,
      minSubtotal: Math.round(Number(form.get("min") || 0) * 100),
      active: true,
      description: String(form.get("description") ?? "").trim(),
    };
    if (codes.some((c) => c.code === code.code)) return setError("That code already exists.");
    start(async () => {
      const r = await createCode(code);
      if (!r.ok) return setError(r.error);
      if (r.demo) writeSaved((s) => ({ ...s, codes: [code, ...s.codes] }));
      setCodes((list) => [code, ...list]);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
      <div className="overflow-x-auto rounded-card bg-cream shadow-soft">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-5 py-3 font-semibold">Code</th><th className="px-3 py-3 font-semibold">Discount</th><th className="px-3 py-3 font-semibold">Minimum</th><th className="px-5 py-3 text-right font-semibold">Active</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {codes.map((c) => (
              <tr key={c.code} className={c.active ? "" : "opacity-55"}>
                <td className="px-5 py-3"><span className="font-mono font-semibold tracking-wide">{c.code}</span><span className="block text-muted">{c.description}</span></td>
                <td className="px-3 py-3">{describe(c)}</td>
                <td className="px-3 py-3 text-muted">{c.minSubtotal ? formatGBP(c.minSubtotal) : "None"}</td>
                <td className="px-5 py-3 text-right">
                  <button type="button" role="switch" aria-checked={c.active} aria-label={`${c.code} active`} onClick={() => toggle(c)} className={`relative h-6 w-11 rounded-full transition ${c.active ? "bg-sage" : "bg-espresso/20"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.active ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={add} className="space-y-3 rounded-card bg-cream p-6 shadow-soft">
        <h2 className="text-2xl">New code</h2>
        <div>
          <label htmlFor="nc-code" className="mb-1 block text-sm font-semibold">Code</label>
          <input id="nc-code" name="code" required pattern="[A-Za-z0-9]{3,24}" placeholder="AUTUMN15" className={`${field} uppercase`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nc-kind" className="mb-1 block text-sm font-semibold">Type</label>
            <select id="nc-kind" value={kind} onChange={(e) => setKind(e.target.value as DiscountCode["kind"])} className={field}>
              <option value="percent">Percent off</option>
              <option value="amount">Amount off</option>
              <option value="shipping">Free delivery</option>
            </select>
          </div>
          <div>
            <label htmlFor="nc-value" className="mb-1 block text-sm font-semibold">{kind === "percent" ? "Percent" : kind === "amount" ? "Amount (£)" : "Value"}</label>
            <input id="nc-value" name="value" type="number" min={kind === "shipping" ? 0 : 1} step={kind === "amount" ? "0.5" : "1"} disabled={kind === "shipping"} required={kind !== "shipping"} className={field} />
          </div>
        </div>
        <div>
          <label htmlFor="nc-min" className="mb-1 block text-sm font-semibold">Minimum order (£) <span className="font-normal text-muted">optional</span></label>
          <input id="nc-min" name="min" type="number" min={0} step="0.5" className={field} />
        </div>
        <div>
          <label htmlFor="nc-desc" className="mb-1 block text-sm font-semibold">Description</label>
          <input id="nc-desc" name="description" placeholder="15% off for newsletter readers" className={field} />
        </div>
        {error && <p role="alert" className="text-sm text-ember">{error}</p>}
        <button type="submit" disabled={pending} className="rounded-full bg-espresso px-5 py-2.5 font-semibold text-cream disabled:opacity-50">Create code</button>
      </form>
    </div>
  );
}
