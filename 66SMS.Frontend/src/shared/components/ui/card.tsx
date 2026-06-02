import * as React from "react"

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "service" | "product" | "admin" | "flat"
}) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={`flex flex-col overflow-hidden text-[var(--spa-text)] ${variant === "default" ? "bg-white rounded-3xl border border-[var(--spa-border)] shadow-sm hover:shadow-xl transition-all duration-500" : ""} ${variant === "service" ? "group relative bg-white rounded-3xl border border-[var(--spa-border)] shadow-sm hover:shadow-xl transition-all duration-500" : ""} ${variant === "product" ? "group bg-white rounded-2xl border border-[var(--spa-border)] hover:border-[var(--spa-rose-light)] hover:shadow-lg transition-all duration-300" : ""} ${variant === "admin" ? "bg-white rounded-xl border border-gray-100 shadow-sm" : ""} ${variant === "flat" ? "bg-white rounded-2xl border border-[var(--spa-border)]" : ""} ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={`flex flex-col gap-1 px-6 pt-6 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={`text-lg font-bold leading-snug text-[var(--spa-text)] ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={`text-sm leading-relaxed text-[var(--spa-text-muted)] ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={`px-6 pb-6 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center px-6 py-4 border-t border-[var(--spa-border)] bg-[var(--spa-blush)]/40 ${className || ''}`.trim()}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
