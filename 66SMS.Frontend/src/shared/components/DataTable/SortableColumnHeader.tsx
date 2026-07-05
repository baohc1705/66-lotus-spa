import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

interface SortableColumnHeaderProps {
  label: string;
  column: string;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
}

export function SortableColumnHeader({
  label,
  column,
  orderBy,
  isDescending,
  onSort,
}: SortableColumnHeaderProps) {
  const icon =
    orderBy !== column ? (
      <ArrowUpDown className="w-3 h-3 opacity-40" />
    ) : isDescending ? (
      <ArrowDown className="w-3 h-3 text-lotus-leaf" />
    ) : (
      <ArrowUp className="w-3 h-3 text-lotus-leaf" />
    );

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={TABLE_STYLES.sortBtn}
    >
      {label} {icon}
    </button>
  );
}
