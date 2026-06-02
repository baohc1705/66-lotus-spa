import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={`flex items-center gap-1.5 text-sm font-medium text-gray-700 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${className || ''}`.trim()}
      {...props}
    />
  )
}

export { Label }
