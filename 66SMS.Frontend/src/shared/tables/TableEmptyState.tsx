import type { LucideIcon } from "lucide-react";

type TableEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
};

export function TableEmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="soft-kit-primary flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon className="h-7 w-7 text-kit-primary" />
      </div>
      <div className={action ? "" : "text-center"}>
        <p className="text-sm font-semibold text-kit-heading">{title}</p>
        {hint ? (
          <p className="mt-0.5 text-xs text-kit-muted">{hint}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
