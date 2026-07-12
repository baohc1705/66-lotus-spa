import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"


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
          "bg-adminGreen-100 text-adminGreen-900",
        success: "bg-state-success-bg text-state-success-text",
        warning: "bg-state-warning-bg text-state-warning-text",
        error: "bg-state-danger-bg text-state-danger-text",
        info: "bg-state-info-bg text-state-info-text",
        neutral: "bg-state-neutral-bg text-state-neutral-text",
        outline:
          "border border-adminGray-300 text-adminGray-600",
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
      className={cn(badgeVariants({ variant, size }), className)}
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
