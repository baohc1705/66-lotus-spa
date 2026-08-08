import { X } from "lucide-react";
import { COMMON_MSG } from "@/shared/constants/common.messages";

type TableSelectionBarProps = {
  count: number;
  onClear: () => void;
  actions?: React.ReactNode;
};

export function TableSelectionBar({
  count,
  onClear,
  actions,
}: TableSelectionBarProps) {
  return (
    <div className="soft-kit-primary mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <span>{COMMON_MSG.selected(count)}</span>
      {actions}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 transition-colors hover:text-kit-heading"
        title={COMMON_MSG.clearSelection}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
