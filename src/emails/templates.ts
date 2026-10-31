/*
 * The shop's emails, as plain HTML that works across email apps: tables for layout, inline styles,
 * web-safe fallbacks for the fonts, and an animated GIF header (a cup being stirred, with cinders rising).
 * Apple Mail and iOS also get the brand fonts and a gently glowing button.
 *
 * This file has no imports other than types, so scripts/make-email-templates.mts can run it directly
 * to write the Supabase auth templates (supabase/templates) and local previews.
 */

import type { Order, Product } from "../lib/types";

const c = {
  paper: "#f4f1ec",
  cream: "#fcfbf8",
  sand: "#e9e3da",
  espresso: "#16100c",
  roast: "#3e3129",
  muted: "#6f645c",
  ember: "#d9480f",
  crema: "#f2c48d",
};
const sans = "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const display = "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif";

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
const money = (pence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: pence % 100 ? 2 : 0 }).format(pence / 100);

export type Email = { subject: string; html: string; text: string };

/** A heading with one warm italic phrase, e.g. heading("One click and", "you're in") */
function heading(plain: string, italic = "", after = "") {
  return `<h1 class="h1" style="margin:0 0 16px;font-family:${display};font-weight:600;font-size:40px;line-height:1.04;letter-spacing:-1.2px;color:${c.espresso}">${plain}${
    italic ? ` <em style="font-family:${serif};font-weight:400;font-style:italic;letter-spacing:-0.4px;color:${c.ember}">${italic}</em>` : ""
  }${after}</h1>`;
}

const p = (html: string, style = "") => `<p style="margin:0 0 16px;font-family:${sans};font-size:16px;line-height:1.6;color:${c.roast};${style}">${html}</p>`;

/** A button that survives Outlook: a padded table cell, not a styled link alone */
function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td class="btn" style="border-radius:999px;background:${c.ember};box-shadow:0 10px 24px -10px rgba(217,72,15,.7)">
<a href="${href}" style="display:inline-block;padding:16px 32px;font-family:${sans};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${label}&nbsp;&rarr;</a></td></tr></table>`;
}

const small = (html: string) => `<p style="margin:16px 0 0;font-family:${sans};font-size:13px;line-height:1.6;color:${c.muted}">${html}</p>`;

function fallbackLink(href: string) {
  return small(`Button not working? Copy this link into your browser:<br><a href="${href}" style="color:${c.ember};word-break:break-all">${href}</a>`);
}

/** Three small reasons, side by side (stacked on phones) */
function perks(items: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;border-top:1px solid ${c.sand}"><tr>${items
    .map(
      ([t, d]) =>
        `<td class="stack" valign="top" style="padding:18px 8px 0 0;width:33%"><p style="margin:0;font-family:${display};font-size:16px;font-weight:600;color:${c.espresso}">${t}</p><p style="margin:4px 0 0;font-family:${sans};font-size:13px;line-height:1.5;color:${c.muted}">${d}</p></td>`,
    )
    .join("")}</tr></table>`;
}

function layout({ site, title, preheader, body, footer = "" }: { site: string; title: string; preheader: string; body: string; footer?: string }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Instrument+Sans:wght@400;600&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
  .btn { animation: glow 2.6s ease-in-out infinite; }
  @keyframes glow { 0%, 100% { box-shadow: 0 10px 24px -10px rgba(217,72,15,.7); } 50% { box-shadow: 0 10px 34px -6px rgba(255,122,46,.9); } }
  a { color: ${c.ember}; }
  @media (max-width: 620px) {
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .h1 { font-size: 32px !important; }
    .stack { display: block !important; width: 100% !important; }
  }
  @media (prefers-reduced-motion: reduce) { .btn { animation: none; } }
</style>
</head>
<body style="margin:0;padding:0;background:${c.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.paper}"><tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
    <tr><td style="background:${c.espresso};border-radius:28px 28px 0 0;padding:26px 32px 4px">
      <a href="${site}" style="text-decoration:none"><img src="${site}/email/logo.png" width="193" height="50" alt="Cinderfield Coffee Roasters" style="display:block;border:0"></a>
    </td></tr>
    <tr><td style="background:${c.espresso};line-height:0"><img src="${site}/email/hero.gif" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    <tr><td class="px" style="background:${c.cream};border-radius:0 0 28px 28px;padding:40px 48px 44px">
${body}
    </td></tr>
    <tr><td style="padding:24px 24px 0;text-align:center;font-family:${sans};font-size:12px;line-height:1.7;color:${c.muted}">
      ${footer}Cinderfield Coffee Roasters · Roasted every Tuesday, posted Wednesday<br>
      <a href="${site}" style="color:${c.muted}">Visit the shop</a> · <a href="${site}/account" style="color:${c.muted}">Your account</a> · <a href="${site}/privacy" style="color:${c.muted}">Privacy</a>
    </td></tr>
  </table>
</td></tr></table>
</body>
</html>`;
}

// ---------- Account emails (sent by Supabase; {{ .Placeholders }} are filled in by Supabase) ----------

const authFooter = "You're getting this because someone used this address on our shop. If it wasn't you, ignore it and nothing will change.<br><br>";

export function authEmails(site = "{{ .SiteURL }}", link = "{{ .ConfirmationURL }}") {
  return {
    confirmation: {
      subject: "Confirm your email for Cinderfield",
      html: layout({
        site,
        title: "Confirm your email",
        preheader: "One click and your Cinderfield account is ready.",
        body: [
          heading("One click and", "you're in."),
          p("Thanks for signing up. Confirm your email and every order, subscription and review lives in one place."),
          button(link, "Confirm my account"),
          perks([
            ["Every order", "Track it from roast day to your door"],
            ["Subscriptions", "Change your card or cancel in seconds"],
            ["Faster checkout", "We remember who you are"],
          ]),
          fallbackLink(link),
        ].join("\n"),
        footer: authFooter,
      }),
    },
    recovery: {
      subject: "Choose a new password",
      html: layout({
        site,
        title: "Choose a new password",
        preheader: "Here's the link to choose a new password. It works for an hour.",
        body: [heading("Let's get you", "back in."), p("Someone (hopefully you) asked to reset the password for this account. The link works for an hour."), button(link, "Choose a new password"), fallbackLink(link)].join("\n"),
        footer: authFooter,
      }),
    },
    magicLink: {
      subject: "Your sign-in link",
      html: layout({
        site,
        title: "Your sign-in link",
        preheader: "Sign in to Cinderfield with one click.",
        body: [heading("Your sign-in", "link."), p("Click below to sign in. The link works once, for an hour."), button(link, "Sign me in"), fallbackLink(link)].join("\n"),
        footer: authFooter,
      }),
    },
    emailChange: {
      subject: "Confirm your new email address",
      html: layout({
        site,
        title: "Confirm your new email",
        preheader: "Confirm the change to your Cinderfield account's email.",
        body: [heading("Confirm your", "new email."), p("Click below to change the email on your account to <strong>{{ .NewEmail }}</strong>."), button(link, "Confirm the change"), fallbackLink(link)].join("\n"),
        footer: authFooter,
      }),
    },
    invite: {
      subject: "You've been invited to Cinderfield",
      html: layout({
        site,
        title: "You're invited",
        preheader: "Accept your invitation to Cinderfield Coffee Roasters.",
        body: [heading("You've been", "invited."), p("You've been invited to create an account at Cinderfield Coffee Roasters."), button(link, "Accept the invitation"), fallbackLink(link)].join("\n"),
        footer: authFooter,
      }),
    },
  };
}

// ---------- Shop emails (sent by the site through Resend) ----------

type CardProduct = Pick<Product, "slug" | "name" | "origin" | "notes" | "price250">;

function productCards(site: string, products: CardProduct[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr>${products
    .map(
      (pr) => `<td class="stack" valign="top" align="center" style="width:33%;padding:0 6px 14px">
  <a href="${site}/coffee/${pr.slug}" style="text-decoration:none;display:block;background:${c.paper};border-radius:22px;padding:18px 12px 16px">
    <img src="${site}/email/bags/${pr.slug}.png" width="120" alt="" style="display:block;margin:0 auto;width:120px;height:auto;border:0">
    <p style="margin:12px 0 0;font-family:${display};font-size:17px;font-weight:600;letter-spacing:-0.3px;color:${c.espresso}">${esc(pr.name)}</p>
    <p style="margin:4px 0 0;font-family:${sans};font-size:12px;color:${c.muted}">${esc(pr.notes.slice(0, 2).join(" · "))}</p>
    <p style="margin:8px 0 0;font-family:${sans};font-size:13px;font-weight:600;color:${c.ember}">from ${money(pr.price250)}</p>
  </a></td>`,
    )
    .join("")}</tr></table>`;
}

export function newsletterWelcome({ site, products, unsubscribe }: { site: string; products: CardProduct[]; unsubscribe: string }): Email {
  const picks = products.slice(0, 3);
  return {
    subject: "You're on the list ☕",
    html: layout({
      site,
      title: "You're on the list",
      preheader: "One email a month: new coffees first, small lots before they sell out.",
      body: [
        heading("You're on", "the list."),
        p("Thanks for joining. Once a month we'll write with new single origins, small lots before they sell out, and the odd brewing tip. Nothing else, ever."),
        `<p style="margin:28px 0 12px;font-family:${sans};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${c.ember}">On the roaster this week</p>`,
        productCards(site, picks),
        button(`${site}/shop`, "Shop this week's roast"),
      ].join("\n"),
      footer: `Don't want these? <a href="${unsubscribe}" style="color:${c.muted}">Unsubscribe</a> in one click.<br><br>`,
    }),
    text: `You're on the list.\n\nThanks for joining. Once a month we'll write with new single origins, small lots before they sell out, and the odd brewing tip.\n\nOn the roaster this week:\n${picks.map((pr) => `- ${pr.name} (${pr.notes.slice(0, 2).join(", ")}), from ${money(pr.price250)}: ${site}/coffee/${pr.slug}`).join("\n")}\n\nShop: ${site}/shop\n\nUnsubscribe: ${unsubscribe}`,
  };
}

const grindLabel: Record<string, string> = { whole: "Whole bean", espresso: "Espresso", moka: "Moka pot", filter: "Filter", cafetiere: "Cafetière" };
const countryName: Record<string, string> = { GB: "United Kingdom", IE: "Ireland", FR: "France", DE: "Germany", NL: "Netherlands", US: "United States" };

export function orderConfirmation({ site, order, slugs }: { site: string; order: Order; slugs: Record<string, string> }): Email {
  const first = order.name?.split(" ")[0] || "there";
  const subscription = order.lines.find((l) => l.every);
  const rows = order.lines
    .map(
      (l) => `<tr>
  <td width="64" valign="middle" style="padding:10px 0">${slugs[l.productId] ? `<img src="${site}/email/bags/${slugs[l.productId]}.png" width="48" alt="" style="display:block;width:48px;height:auto;border:0">` : ""}</td>
  <td valign="middle" style="padding:10px 8px;font-family:${sans};font-size:15px;color:${c.espresso}"><strong>${l.qty} × ${esc(l.name)}</strong><br><span style="font-size:13px;color:${c.muted}">${l.size} · ${grindLabel[l.grind] ?? l.grind}${l.every ? ` · every ${l.every} weeks` : ""}</span></td>
  <td valign="middle" align="right" style="padding:10px 0;font-family:${sans};font-size:15px;color:${c.espresso};white-space:nowrap">${money(l.unitPrice * l.qty)}</td>
</tr>`,
    )
    .join("");
  const total = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-family:${sans};font-size:${strong ? 17 : 14}px;color:${strong ? c.espresso : c.muted};${strong ? "font-weight:600" : ""}">${label}</td><td align="right" style="padding:4px 0;font-family:${sans};font-size:${strong ? 17 : 14}px;color:${c.espresso};${strong ? "font-weight:600" : ""}">${value}</td></tr>`;
  const a = order.address;
  const address = a ? [order.name, a.line1, a.line2, `${a.city} ${a.postcode}`, countryName[a.country] ?? a.country].filter(Boolean).map((x) => esc(String(x))).join("<br>") : "";
  const step = (n: string, t: string, d: string, on: boolean) =>
    `<td class="stack" valign="top" style="width:33%;padding:0 8px 12px 0"><p style="margin:0;font-family:${display};font-size:28px;font-weight:600;color:${on ? c.ember : c.sand}">${n}</p><p style="margin:2px 0 0;font-family:${sans};font-size:14px;font-weight:600;color:${c.espresso}">${t}</p><p style="margin:2px 0 0;font-family:${sans};font-size:13px;color:${c.muted}">${d}</p></td>`;

  return {
    subject: `Order #${order.number} is on the roast list`,
    html: layout({
      site,
      title: `Order #${order.number}`,
      preheader: `Thanks, ${first}! We'll roast your coffee on Tuesday and post it on Wednesday.`,
      body: [
        `<p style="margin:0 0 10px;font-family:${sans};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${c.ember}">Order #${order.number}</p>`,
        heading(`Thanks, ${esc(first)}!`, "It's on the roast list."),
        p("We roast every Tuesday and post on Wednesday, so your coffee arrives a few days after roasting, when it tastes its best."),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px"><tr>${step("01", "Confirmed", "We've got your order", true)}${step("02", "Roasting", "This Tuesday", false)}${step("03", "On its way", "Posted Wednesday", false)}</tr></table>`,
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-top:1px solid ${c.sand};border-bottom:1px solid ${c.sand}">${rows}</table>`,
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0">${total("Subtotal", money(order.subtotal))}${order.discount ? total(`Discount${order.code ? ` (${esc(order.code)})` : ""}`, `−${money(order.discount)}`) : ""}${total("Delivery", order.shipping ? money(order.shipping) : "Free")}${total("Total", money(order.total), true)}</table>`,
        address ? `<p style="margin:24px 0 4px;font-family:${sans};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${c.muted}">Delivering to</p><p style="margin:0;font-family:${sans};font-size:15px;line-height:1.6;color:${c.espresso}">${address}</p>` : "",
        subscription ? p(`<strong>Your subscription has started.</strong> The next bag comes in ${subscription.every} weeks, with free delivery. You can update your card or cancel from your account at any time.`, "margin-top:20px;background:" + c.paper + ";border-radius:16px;padding:14px 16px") : "",
        button(`${site}/account`, "See your order"),
        small("Questions about your order? Just reply to this email."),
      ].join("\n"),
    }),
    text: `Thanks, ${first}! Order #${order.number} is on the roast list.\n\n${order.lines.map((l) => `${l.qty} x ${l.name}, ${l.size}, ${grindLabel[l.grind] ?? l.grind}${l.every ? `, every ${l.every} weeks` : ""}: ${money(l.unitPrice * l.qty)}`).join("\n")}\n\nTotal: ${money(order.total)}\n\nWe roast on Tuesday and post on Wednesday. See your order: ${site}/account`,
  };
}
