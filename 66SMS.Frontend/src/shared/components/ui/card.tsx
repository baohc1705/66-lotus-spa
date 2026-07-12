import * as React from "react"
import { cn } from "@/lib/utils"

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
      className={cn("flex flex-col overflow-hidden text-lotus-deep", variant === "default" && "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300", variant === "service" && "group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300", variant === "product" && "group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300", variant === "admin" && "bg-white rounded-md shadow-sm", variant === "flat" && "bg-adminGray-50 rounded-lg", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1 px-6 pt-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-bold leading-snug text-[var(--spa-text)]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-[var(--spa-text-muted)]", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 py-4 border-t border-[var(--spa-border)] bg-[var(--spa-blush)]/40", className)}
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
