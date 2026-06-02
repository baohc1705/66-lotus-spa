import * as React from "react"


function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto bg-white rounded-xl"
    >
      <table
        data-slot="table"
        className={`w-full caption-bottom text-left text-sm border-collapse ${className || ''}`.trim()}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={`bg-[#F9FAFB] border-b border-gray-100 sticky top-0 z-20 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={`[&_tr:last-child]:border-0 ${className || ''}`.trim()}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={`border-t border-[var(--spa-ui-border)] bg-white font-medium ${className || ''}`.trim()}
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
      className={`border-b border-gray-100/80 transition-colors group ${selected ? "bg-blue-50/60 hover:bg-blue-100/50" : "bg-white hover:bg-slate-50/80"} ${className || ''}`.trim()}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={`px-4 py-3 text-xs font-semibold text-[var(--spa-ui-text)] tracking-wider whitespace-nowrap text-left align-middle border-b border-gray-100 [&:has([role=checkbox])]:w-[50px] [&:has([role=checkbox])]:text-center ${className || ''}`.trim()}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={`px-4 py-3 text-sm text-[var(--spa-ui-text)] align-middle whitespace-nowrap overflow-hidden [&:has([role=checkbox])]:text-center [&:has([role=checkbox])]:w-[50px] ${className || ''}`.trim()}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={`mt-4 text-sm text-[var(--spa-text-muted)] ${className || ''}`.trim()}
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
