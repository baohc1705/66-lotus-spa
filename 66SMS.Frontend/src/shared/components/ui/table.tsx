import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto bg-white rounded-xl"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-left text-sm border-collapse",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-[#F9FAFB] border-b border-gray-100 sticky top-0 z-20",
        className,
      )}
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
      className={cn(
        "border-t border-[var(--spa-ui-border)] bg-white font-medium",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<"tr"> & { selected?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      className={cn(
        "border-b border-gray-100/80 transition-colors group",
        selected
          ? "bg-blue-50/60 hover:bg-blue-100/50"
          : "bg-white hover:bg-slate-50/80",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 py-3 text-xs font-semibold text-[var(--spa-ui-text)] tracking-wider",
        "whitespace-nowrap text-left align-middle",
        "border-b border-gray-100",
        "[&:has([role=checkbox])]:w-[50px] [&:has([role=checkbox])]:text-center",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 text-sm text-[var(--spa-ui-text)]",
        "align-middle whitespace-nowrap overflow-hidden",
        "[&:has([role=checkbox])]:text-center [&:has([role=checkbox])]:w-[50px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-[var(--spa-text-muted)]", className)}
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
