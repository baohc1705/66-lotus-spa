import type { ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate"
  | "light"
  | "dark";

type BadgeProps = {
  variant?: BadgeVariant;
  children?: ReactNode;
  className?: string;
  soft?: boolean;
  pill?: boolean;
  href?: string;
};

function resolveVariant(variant: BadgeVariant, soft: boolean): string {
  if (soft) {
    if (variant === "secondary") return "soft-kit-secondary";
    if (variant === "success") return "soft-kit-success";
    if (variant === "danger") return "soft-kit-danger";
    if (variant === "warning") return "soft-kit-warning";
    if (variant === "info") return "soft-kit-info";
    if (variant === "focus") return "bg-slate-100 text-kit-focus";
    if (variant === "alternate") return "bg-purple-100 text-kit-alt";
    if (variant === "light") return "soft-kit-light";
    if (variant === "dark") return "soft-kit-dark";
    return "soft-kit-primary";
  }

  if (variant === "secondary") return "bg-kit-secondary text-kit-white";
  if (variant === "success") return "bg-kit-success text-kit-white";
  if (variant === "danger") return "bg-kit-danger text-kit-white";
  if (variant === "warning") return "bg-kit-warning text-kit-on-warning";
  if (variant === "info") return "bg-kit-info text-kit-white";
  if (variant === "focus") return "bg-kit-focus text-kit-white";
  if (variant === "alternate") return "bg-kit-alt text-kit-white";
  if (variant === "light")
    return "bg-kit-white text-kit-dark border border-kit";
  if (variant === "dark") return "bg-kit-dark text-kit-white";
  return "bg-kit-primary text-kit-white";
}

export function Badge({
  variant = "primary",
  children,
  className = "",
  soft = false,
  pill = false,
  href,
}: BadgeProps) {
  const badgeClass =
    "inline-flex items-center justify-center px-2.5 py-1 " +
    "min-w-5 text-xs font-bold uppercase leading-none font-sans " +
    (pill ? "rounded-full " : "rounded ") +
    resolveVariant(variant, soft) +
    " " +
    className;

  if (href) {
    return (
      <a href={href} className={badgeClass + " no-underline hover:opacity-90"}>
        {children}
      </a>
    );
  }

  return <span className={badgeClass}>{children}</span>;
}
