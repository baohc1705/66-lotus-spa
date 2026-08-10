import type { ReactNode } from "react";

type ListGroupProps = {
  children?: ReactNode;
  className?: string;
  flush?: boolean;
};

export type ListGroupTone =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "focus"
  | "alternate";

type ListGroupItemProps = {
  children?: ReactNode;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  action?: boolean;
  tone?: ListGroupTone;
  onClick?: () => void;
  href?: string;
};

function toneClass(tone: ListGroupTone): string {
  if (tone === "primary") return "soft-kit-primary ";
  if (tone === "secondary") return "soft-kit-secondary ";
  if (tone === "success") return "soft-kit-success ";
  if (tone === "info") return "soft-kit-info ";
  if (tone === "warning") return "soft-kit-warning ";
  if (tone === "danger") return "soft-kit-danger ";
  if (tone === "focus") return "soft-kit-focus ";
  if (tone === "alternate") return "soft-kit-alternate ";
  return "";
}

export function ListGroup({ children, className = "", flush = false }: ListGroupProps) {
  const base = flush
    ? "overflow-hidden bg-kit-white "
    : "overflow-hidden rounded border border-kit bg-kit-white ";
  return <ul className={base + className}>{children}</ul>;
}

export function ListGroupItem({
  children,
  className = "",
  active = false,
  disabled = false,
  action = false,
  tone = "default",
  onClick,
  href,
}: ListGroupItemProps) {
  let itemClass =
    "flex w-full items-center justify-between border-b border-kit-primary/10 " +
    "px-4 py-2 text-left text-sm font-sans last:border-b-0 ";

  if (active) {
    itemClass += "bg-kit-primary text-kit-white border-kit-primary ";
  } else if (disabled) {
    itemClass += "pointer-events-none text-kit-muted opacity-60 ";
  } else {
    itemClass += toneClass(tone) || "bg-kit-white text-kit-body ";
    if (action) itemClass += "hover:bg-kit-page cursor-pointer ";
  }

  itemClass += className;

  if (onClick || action) {
    return (
      <li>
        <button type="button" disabled={disabled} onClick={onClick} className={itemClass}>
          {children}
        </button>
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <a href={href} className={itemClass + (disabled ? " pointer-events-none" : "")}>
          {children}
        </a>
      </li>
    );
  }

  return <li className={itemClass}>{children}</li>;
}
