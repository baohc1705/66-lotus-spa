import type { ReactNode } from "react";

type TableDetailExpandedProps = {
  children: ReactNode;
  className?: string;
  maxHeightClass?: string;
};

export function TableDetailExpanded({
  children,
  className = "",
  maxHeightClass = "max-h-100",
}: TableDetailExpandedProps) {
  return (
    <div
      className={
        "w-full overflow-hidden overflow-y-auto bg-kit-page/40 px-3 py-2 " +
        maxHeightClass +
        " " +
        className
      }
    >
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

type TableDetailHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
};

export function TableDetailHeader({
  icon,
  title,
  subtitle,
}: TableDetailHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-kit pb-2">
      {icon ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-kit bg-kit-white p-0.5 shadow-kit-card">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-kit-heading">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs font-medium text-kit-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

type TableDetailGridCols = 1 | 2 | 3 | 4;

const gridColsClass: Record<TableDetailGridCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function TableDetailGrid({
  children,
  className = "",
  cols = 2,
}: {
  children: ReactNode;
  className?: string;
  cols?: TableDetailGridCols;
}) {
  return (
    <div
      className={
        "grid grid-cols-1 gap-x-4 gap-y-0 " + gridColsClass[cols] + " " + className
      }
    >
      {children}
    </div>
  );
}

export function TableDetailField({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="border-b border-kit py-1 last:border-b-0">
      <p className="mb-0.5 text-xs text-kit-muted">{label}</p>
      <div className="truncate text-sm font-medium text-kit-heading">
        {value == null || value === "" ? "—" : value}
      </div>
    </div>
  );
}

export function TableDetailActions({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "mt-1 flex items-end justify-end gap-2 border-t border-kit pt-2 " +
        className
      }
    >
      {children}
    </div>
  );
}
