import type { ReactNode } from "react";

export type AlertVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "focus"
  | "alternate"
  | "light"
  | "dark";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

export function Alert({
  variant = "primary",
  children,
  onClose,
  className = "",
}: AlertProps) {
  const softClass =
    variant === "alternate" ? "soft-kit-alternate" : "soft-kit-" + variant;

  return (
    <div
      className={
        "alert relative mb-3 rounded border px-4 py-3 text-sm font-sans " +
        "alert-" +
        variant +
        " " +
        softClass +
        " " +
        className
      }
      role="alert"
    >
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="btn-close absolute right-3 top-3 text-lg leading-none opacity-50 hover:opacity-100"
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
      <div className={onClose ? "pr-6" : ""}>{children}</div>
    </div>
  );
}

export function AlertLink({
  href = "#",
  children,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={"alert-link font-bold " + className}>
      {children}
    </a>
  );
}
