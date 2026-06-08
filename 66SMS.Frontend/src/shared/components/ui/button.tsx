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
          "bg-lotus-leaf text-white",
          "hover:bg-lotus-leaf/90",
          "shadow-sm",
        ].join(" "),

        secondary: [
          "bg-lotus-cream text-lotus-deep",
          "hover:bg-lotus-cream/80",
        ].join(" "),

        outline: [
          "bg-transparent text-lotus-deep",
          "hover:bg-lotus-cream hover:text-lotus-deep",
        ].join(" "),

        gold: [
          "bg-yellow-500 text-white",
          "hover:opacity-90",
          "shadow-sm",
        ].join(" "),

        ghost: [
          "bg-transparent text-lotus-stone",
          "hover:bg-lotus-cream hover:text-lotus-deep",
          "shadow-none",
          "hover:translate-y-0",
        ].join(" "),

        dark: [
          "bg-lotus-deep text-white",
          "hover:opacity-90",
        ].join(" "),

        admin: [
          "bg-lotus-leaf text-white",
          "hover:bg-lotus-leaf/90",
          "shadow-sm",
        ].join(" "),

        destructive: [
          "bg-red-50 text-red-600",
          "hover:bg-red-100",
        ].join(" "),

        link: [
          "text-lotus-leaf underline-offset-4 hover:underline",
          "hover:translate-y-0 shadow-none",
        ].join(" "),
      },

      size: {
        sm: "text-xs px-3 py-1.5 rounded-sm",
        default: "text-sm px-4 py-2 rounded-md",
        lg: "text-base px-6 py-3 rounded-md",
        xl: "text-base px-8 py-4 rounded-lg",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-sm",
        "icon-lg": "size-12 rounded-md",
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
