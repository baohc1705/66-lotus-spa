import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"


const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-full font-semibold tracking-wide whitespace-nowrap",
    "transition-colors",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        rose: "bg-[var(--spa-rose)] text-white",
        gold: "bg-[var(--spa-gold-light)] text-[var(--spa-gold)]",
        blush: "bg-[var(--spa-blush)] text-[var(--spa-rose)]",
        white:
          "bg-white/20 text-white border border-white/30 backdrop-blur-sm",
        admin:
          "bg-[var(--spa-admin-accent)] text-[var(--spa-admin-primary)]",
        success: "bg-green-50 text-green-700",
        warning: "bg-yellow-50 text-yellow-700",
        error: "bg-red-50 text-red-600",
        outline:
          "border border-[var(--spa-border)] text-[var(--spa-text-muted)]",
      },
      size: {
        sm: "text-xs px-2.5 py-1",
        default: "text-xs px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "blush",
      size: "default",
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  dot?: boolean
}

function Badge({
  className,
  variant = "blush",
  size = "default",
  asChild = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={`${badgeVariants({ variant, size })} ${className || ''}`.trim()}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      {children}
    </Comp>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
