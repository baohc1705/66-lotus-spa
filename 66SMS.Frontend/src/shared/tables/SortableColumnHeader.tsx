import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortableColumnHeaderProps = {
  label: string;
  column: string;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onPrimary?: boolean;
};

export function SortableColumnHeader({
  label,
  column,
  orderBy,
  isDescending,
  onSort,
  onPrimary = false,
}: SortableColumnHeaderProps) {
  const idleIcon = onPrimary
    ? "h-3 w-3 text-kit-white/50"
    : "h-3 w-3 opacity-40";
  const activeIcon = onPrimary
    ? "h-3 w-3 text-kit-white"
    : "h-3 w-3 text-kit-primary";

  const icon =
    orderBy !== column ? (
      <ArrowUpDown className={idleIcon} />
    ) : isDescending ? (
      <ArrowDown className={activeIcon} />
    ) : (
      <ArrowUp className={activeIcon} />
    );

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={
        "inline-flex items-center gap-1 text-sm font-semibold " +
        (onPrimary
          ? "text-kit-white/90 hover:text-kit-white"
          : "text-kit-muted hover:text-kit-heading")
      }
    >
      {label} {icon}
    </button>
  );
}
