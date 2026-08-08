import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

type DataTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  debounceMs?: number;
};

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  debounceMs = 300,
}: DataTableToolbarProps) {
  const [localValue, setLocalValue] = useState(searchValue);
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);

  // Sync when parent resets search (avoid setState inside useEffect)
  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setLocalValue(searchValue);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchValue) {
        onSearchChange(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearchChange, searchValue]);

  return (
    <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
        <input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-md border border-kit bg-kit-white py-2 pr-8 pl-9 text-sm text-kit-body outline-none focus:border-kit-primary focus:ring-2 focus:ring-blue-600/25"
        />
        {localValue ? (
          <button
            type="button"
            onClick={() => {
              setLocalValue("");
              onSearchChange("");
            }}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-kit-muted hover:text-kit-heading"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {children ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
