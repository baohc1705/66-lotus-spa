import { useEffect, useRef, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>;
  columnLabels?: Record<string, string>;
};

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const hideableColumns = table
    .getAllColumns()
    .filter(
      (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
    );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kit bg-kit-white px-3 text-xs text-kit-body hover:bg-kit-page"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Cột
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border border-kit bg-kit-white p-2 shadow-kit-pop">
          {hideableColumns.map((column) => (
            <label
              key={column.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-kit-body hover:bg-kit-page"
            >
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={(e) => column.toggleVisibility(e.target.checked)}
                className="rounded border-kit text-kit-primary focus:ring-2 focus:ring-blue-600/25"
              />
              <span className="capitalize">{columnLabels[column.id] || column.id}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
