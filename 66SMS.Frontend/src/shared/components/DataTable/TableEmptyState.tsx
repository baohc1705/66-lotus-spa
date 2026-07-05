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
      <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
        <Icon className="w-7 h-7 text-lotus-stone" />
      </div>
      <div className={action ? "" : "text-center"}>
        <p className="text-sm font-semibold text-lotus-deep">{title}</p>
        <p className="text-[12px] text-lotus-stone mt-0.5">{hint}</p>
      </div>
      {action}
    </div>
  );
}
