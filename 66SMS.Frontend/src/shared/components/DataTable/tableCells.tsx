import { EMPTY_CELL } from "@/shared/constants/display.const";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

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
    <span className={TABLE_STYLES.cellIndex}>
      {(pageIndex - 1) * pageSize + rowIndex + 1}
    </span>
  );
}

export function NameCell({ value }: { value?: string | null }) {
  return (
    <span className={TABLE_STYLES.cellName}>{value ?? EMPTY_CELL}</span>
  );
}

export function TextCell({ value }: { value?: string | null }) {
  return (
    <span className={TABLE_STYLES.cellTruncate}>{value || EMPTY_CELL}</span>
  );
}

export function MutedCell({ value }: { value?: string | number | null }) {
  return (
    <span className={TABLE_STYLES.cellMuted}>
      {value ?? EMPTY_CELL}
    </span>
  );
}

export function DateTimeCell({ value }: { value?: string | null }) {
  return (
    <span className={TABLE_STYLES.cellMutedSmall}>
      {formatDateTimeDisplay(value)}
    </span>
  );
}
