"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"


function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={`shrink-0 bg-[var(--spa-border)] data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch ${className || ''}`.trim()}
      {...props}
    />
  )
}

export { Separator }
