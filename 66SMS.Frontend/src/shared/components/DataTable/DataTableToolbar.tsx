import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  debounceMs?: number;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  debounceMs = 300,
}: DataTableToolbarProps) {
  const [localValue, setLocalValue] = useState(searchValue);

  useEffect(() => {
    setTimeout(() => {
      setLocalValue(searchValue);
    }, 0);
  }, [searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchValue) {
        onSearchChange(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearchChange, searchValue]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lotus-stone pointer-events-none" />
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 pr-8 py-2 text-sm h-9 rounded-lg border-adminGray-100/50 bg-white/60 focus:bg-white"
        />
        {localValue && (
          <button
            onClick={() => {
              setLocalValue("");
              onSearchChange("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-lotus-stone hover:text-lotus-deep transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
