import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "font-semibold whitespace-nowrap select-none",
    "transition-all duration-200 ease-out",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--spa-rose)] focus-visible:ring-offset-2",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
    "hover:-translate-y-0.5 active:translate-y-0",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--spa-rose)] text-white",
          "hover:bg-[var(--spa-rose-hover)]",
          "shadow-rose hover:shadow-rose-lg",
        ].join(" "),

        secondary: [
          "bg-white text-[var(--spa-rose)]",
          "border-2 border-[var(--spa-rose)]",
          "hover:bg-[var(--spa-blush)]",
        ].join(" "),

        outline: [
          "bg-transparent text-[var(--spa-text)]",
          "border border-[var(--spa-border)]",
          "hover:border-[var(--spa-rose)] hover:text-[var(--spa-rose)]",
        ].join(" "),

        gold: [
          "bg-[var(--spa-gold)] text-white",
          "hover:opacity-90",
          "shadow-gold",
        ].join(" "),

        ghost: [
          "bg-transparent text-[var(--spa-rose)]",
          "hover:bg-[var(--spa-blush)]",
          "shadow-none",
          "hover:translate-y-0",
        ].join(" "),

        dark: [
          "bg-[var(--spa-text)] text-white",
          "hover:opacity-90",
        ].join(" "),

        admin: [
          "bg-[var(--spa-admin-primary)] text-white",
          "hover:bg-[var(--spa-admin-primary-hover)]",
          "shadow-sm shadow-blue-500/10",
          "focus-visible:ring-[var(--spa-admin-primary)]",
        ].join(" "),

        destructive: [
          "bg-red-50 text-red-600",
          "border border-red-200",
          "hover:bg-red-100",
          "focus-visible:ring-red-400",
        ].join(" "),

        link: [
          "text-[var(--spa-rose)] underline-offset-4 hover:underline",
          "hover:translate-y-0 shadow-none",
        ].join(" "),
      },

      size: {
        sm: "text-xs px-4 py-2 rounded-lg",
        default: "text-sm px-6 py-3 rounded-xl",
        lg: "text-base px-8 py-3.5 rounded-xl",
        xl: "text-base px-10 py-4 rounded-2xl",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  const spinner = (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )

  return (
    <Comp
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? children : (
        <>
          {loading ? spinner : null}
          {children}
        </>
      )}
    </Comp>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
