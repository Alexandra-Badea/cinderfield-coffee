import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ember text-white hover:bg-ember-dark shadow-[0_8px_20px_-8px_rgb(200_90_42/0.7)]",
  dark: "bg-espresso text-cream hover:bg-roast",
  outline: "border border-espresso/25 text-espresso hover:border-espresso hover:bg-espresso/[0.04]",
  ghost: "text-espresso hover:bg-espresso/[0.06]",
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
