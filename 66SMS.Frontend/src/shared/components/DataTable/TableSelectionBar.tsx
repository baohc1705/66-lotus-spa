import { X } from "lucide-react";
import { COMMON_MSG } from "@/shared/constants/common.messages";

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
    <div className="lotus-admin-table-selection-bar">
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
