import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-none border border-adminGray-300 bg-white px-3 py-2 text-sm text-lotus-deep placeholder:text-lotus-stone outline-none transition-colors duration-150 hover:border-adminGray-400 focus:border-adminGreen-600 focus:ring-1 focus:ring-adminGreen-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-adminGray-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
