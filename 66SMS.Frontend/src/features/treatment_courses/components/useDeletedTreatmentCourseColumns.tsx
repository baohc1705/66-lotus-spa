import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  DateTimeCell,
  IndexCell,
} from "@/shared/components/DataTable/tableCells";
import { TABLE_STYLES } from "@/shared/styles/table.styles";

import { TREATMENT_COURSE_COLUMN_LABELS } from "./useActiveTreatmentCourseColumns";
import { TREATMENT_COURSE_PERM } from "../constants/treatmentCourse.permissions";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";

interface UseDeletedTreatmentCourseColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: TreatmentCourseDto) => void;
}

function formatPrice(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function useDeletedTreatmentCourseColumns({
  pageIndex,
  pageSize,
  onRestore,
}: UseDeletedTreatmentCourseColumnsParams) {
  const cols = TREATMENT_COURSE_COLUMN_LABELS;
  const perm = TREATMENT_COURSE_PERM;

  return useMemo<ColumnDef<TreatmentCourseDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowIndex={row.index}
          />
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "code",
        header: cols.code,
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2 py-1 bg-stone-100 rounded text-stone-600">
            {row.original.code ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <div>
            <p className="text-[13px] font-semibold text-lotus-deep truncate max-w-[200px]">
              {row.original.name ?? "—"}
            </p>
            {row.original.categoryName && (
              <p className="text-[11px] text-lotus-stone">
                {row.original.categoryName}
              </p>
            )}
          </div>
        ),
        size: 240,
      },
      {
        accessorKey: "totalSessions",
        header: cols.totalSessions,
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.totalSessions ?? 0}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => (
          <span className="text-lotus-deep font-semibold">
            {formatPrice(row.original.sellingPrice)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "originalPrice",
        header: cols.originalPrice,
        cell: ({ row }) => (
          <span className="text-lotus-stone line-through text-[12px]">
            {formatPrice(row.original.originalPrice)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "updatedAt",
        header: "Ngày xóa",
        cell: ({ row }) => <DateTimeCell value={row.original.updatedAt} />,
        size: 140,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <PermissionGate
            resource={perm.resource}
            action={perm.update}
            role={perm.role}
          >
            <Button
              variant="outline"
              size="sm"
              className={TABLE_STYLES.toolbarBtn}
              onClick={() => onRestore(row.original)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {COMMON_MSG.restore}
            </Button>
          </PermissionGate>
        ),
        size: 120,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onRestore, cols, perm],
  );
}
