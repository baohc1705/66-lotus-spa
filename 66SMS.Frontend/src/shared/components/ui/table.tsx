import * as React from "react"
import { cn } from "@/lib/utils"


function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto bg-white"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-left text-sm border-collapse", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-lotus-leaf-light sticky top-0 z-20", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-stone-50 font-medium", className)}
      {...props}
    />
  )
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("transition-colors group hover:bg-lotus-leaf-light data-[state=selected]:bg-lotus-leaf-light data-[state=expanded]:bg-lotus-leaf-light", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("px-3 py-2 text-xs font-semibold text-lotus-deep tracking-wider whitespace-nowrap text-left align-middle relative [&:has([role=checkbox])]:w-[50px] [&:has([role=checkbox])]:text-center", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-3 py-2 text-[13px] text-lotus-deep align-middle whitespace-nowrap overflow-hidden text-ellipsis [&:has([role=checkbox])]:text-center [&:has([role=checkbox])]:w-[50px]", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-lotus-stone", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
