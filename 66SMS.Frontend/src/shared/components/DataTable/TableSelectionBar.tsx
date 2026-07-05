import { X } from "lucide-react";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

interface TableSelectionBarProps {
  count: number;
  onClear: () => void;
  actions?: React.ReactNode;
}

export function TableSelectionBar({
  count,
  onClear,
  actions,
}: TableSelectionBarProps) {
  return (
    <div className={TABLE_STYLES.selectionBar}>
      <span>{COMMON_MSG.selected(count)}</span>
      {actions}
      <button
        type="button"
        onClick={onClear}
        className="text-lotus-stone hover:text-lotus-deep ml-1 transition-colors"
        title={COMMON_MSG.clearSelection}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
