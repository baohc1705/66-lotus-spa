import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("w-full min-w-0 rounded-md bg-stone-100/80 px-3 py-2 text-[13px] text-lotus-deep placeholder:text-lotus-stone outline-none transition-all duration-200 hover:bg-stone-100 focus:bg-white focus:ring-2 focus:ring-lotus-leaf/30 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[13px] file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  )
}

export { Input }
