import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("w-full min-w-0 rounded-md bg-stone-100/80 px-3 py-2 text-[13px] text-lotus-deep placeholder:text-lotus-stone outline-none transition-all duration-200 hover:bg-stone-100 focus:bg-white focus:ring-2 focus:ring-lotus-leaf/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  )
}

export { Textarea }
