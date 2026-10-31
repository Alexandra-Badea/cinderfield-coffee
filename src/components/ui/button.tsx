import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ember text-white shadow-glow hover:bg-ember-dark hover:-translate-y-0.5",
  dark: "bg-espresso text-cream hover:bg-roast",
  outline: "border border-espresso/25 text-espresso hover:border-espresso hover:bg-espresso/[0.04]",
  ghost: "text-espresso hover:bg-espresso/[0.06]",
  /* on dark sections */
  light: "border border-cream/25 text-cream backdrop-blur hover:border-cream hover:bg-cream/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

/** Class names for a button, so links can look like buttons too */
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-200",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
