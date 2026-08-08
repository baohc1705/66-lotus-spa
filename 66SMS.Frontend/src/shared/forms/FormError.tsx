import type { ReactNode } from "react";

type FormErrorProps = {
  message?: string;
  className?: string;
};

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className={"mb-3 rounded border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-800 " + className}>
      {message}
    </div>
  );
}

export function FormFeedback({
  children,
  type = "invalid",
  tooltip = false,
  className = "",
}: {
  children?: ReactNode;
  type?: "invalid" | "valid";
  tooltip?: boolean;
  className?: string;
}) {
  if (tooltip) {
    const tipColor =
      type === "valid" ? "bg-kit-success text-kit-white" : "bg-kit-danger text-kit-white";
    return (
      <div
        className={
          "absolute left-0 top-full z-5 mt-0.5 max-w-full rounded px-2 py-1 text-sm leading-snug " +
          tipColor +
          " " +
          className
        }
      >
        {children}
      </div>
    );
  }

  const color = type === "valid" ? "text-kit-success" : "text-kit-danger";
  return <div className={"mt-1 text-sm " + color + " " + className}>{children}</div>;
}
