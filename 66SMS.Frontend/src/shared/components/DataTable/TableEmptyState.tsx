import type { LucideIcon } from "lucide-react";

interface TableEmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  action?: React.ReactNode;
}

export function TableEmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="w-14 h-14 rounded-2xl bg-adminGold-100 flex items-center justify-center">
        <Icon className="w-7 h-7 text-adminGold-600" />
      </div>
      <div className={action ? "" : "text-center"}>
        <p className="text-sm font-semibold text-adminInk">{title}</p>
        <p className="text-xs text-adminGray-600 mt-0.5">{hint}</p>
      </div>
      {action}
    </div>
  );
}
