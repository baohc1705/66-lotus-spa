import { EMPTY_CELL } from "@/shared/constants/display.const";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import { formatCurrency } from "@/shared/utils/currency";

export function IndexCell({
  pageIndex,
  pageSize,
  rowIndex,
}: {
  pageIndex: number;
  pageSize: number;
  rowIndex: number;
}) {
  return (
    <span className="text-xs text-kit-muted">
      {(pageIndex - 1) * pageSize + rowIndex + 1}
    </span>
  );
}

export function NameCell({ value }: { value?: string | null }) {
  return <span className="font-medium text-kit-heading">{value ?? EMPTY_CELL}</span>;
}

export function TextCell({ value }: { value?: string | null }) {
  return (
    <span className="block max-w-xs truncate text-kit-body">{value || EMPTY_CELL}</span>
  );
}

export function MutedCell({ value }: { value?: string | number | null }) {
  return <span className="text-kit-muted">{value ?? EMPTY_CELL}</span>;
}

export function MutedSmallCell({ value }: { value?: string | number | null }) {
  return <span className="text-xs text-kit-muted">{value ?? EMPTY_CELL}</span>;
}

export function DateTimeCell({ value }: { value?: string | null }) {
  return <span className="text-xs text-kit-muted">{formatDateTimeDisplay(value)}</span>;
}

export function PriceCell({ value }: { value?: number | null }) {
  return <span className="text-xs text-kit-muted">{formatCurrency(value)}</span>;
}
