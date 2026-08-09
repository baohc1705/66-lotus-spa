import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortableColumnHeaderProps = {
  label: string;
  column: string;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  /** Giữ prop cũ; màu chữ luôn inherit từ th (header primary = trắng) */
  onPrimary?: boolean;
};

export function SortableColumnHeader({
  label,
  column,
  orderBy,
  isDescending,
  onSort,
}: SortableColumnHeaderProps) {
  const icon =
    orderBy !== column ? (
      <ArrowUpDown className="h-3 w-3 text-current opacity-50" />
    ) : isDescending ? (
      <ArrowDown className="h-3 w-3 text-current opacity-100" />
    ) : (
      <ArrowUp className="h-3 w-3 text-current opacity-100" />
    );

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex items-center gap-1 text-sm font-semibold text-current hover:opacity-90"
    >
      {label} {icon}
    </button>
  );
}
