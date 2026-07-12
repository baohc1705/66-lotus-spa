import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-adminGreen-600/50 disabled:cursor-not-allowed disabled:opacity-50 border border-adminGray-300 bg-white data-[state=checked]:border-adminGreen-600 data-[state=checked]:bg-adminGreen-600 data-[state=checked]:text-white data-[state=indeterminate]:border-adminGreen-600 data-[state=indeterminate]:bg-adminGreen-600 data-[state=indeterminate]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none [&>svg]:size-3.5"
      >
        {checked === "indeterminate" ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
