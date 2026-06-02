import * as React from "react"


function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={`animate-pulse rounded-xl bg-[var(--spa-blush)] ${className || ''}`.trim()}
      {...props}
    />
  )
}

export { Skeleton }
