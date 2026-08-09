import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DateTimeCell,
  IndexCell,
  PriceCell,
} from "@/shared/tables/TableCells";

import { TREATMENT_COURSE_COLUMN_LABELS } from "./useActiveTreatmentCourseColumns";
import { TREATMENT_COURSE_PERM } from "../constants/treatmentCourse.permissions";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";

interface UseDeletedTreatmentCourseColumnsParams {
  pageIndex: number;
  pageSize: number;
  onRestore: (item: TreatmentCourseDto) => void;
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
          <Badge variant="secondary" soft>
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <div>
            <p className="max-w-[200px] truncate text-sm font-semibold text-kit-heading">
              {row.original.name ?? "—"}
            </p>
            {row.original.categoryName ? (
              <p className="text-xs text-kit-muted">
                {row.original.categoryName}
              </p>
            ) : null}
          </div>
        ),
        size: 240,
      },
      {
        accessorKey: "totalSessions",
        header: cols.totalSessions,
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
            {row.original.totalSessions ?? 0}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 120,
      },
      {
        accessorKey: "originalPrice",
        header: cols.originalPrice,
        cell: ({ row }) => <PriceCell value={row.original.originalPrice} />,
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => <DateTimeCell value={row.original.createdAt} />,
        size: 140,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <PermissionGate
            resource={perm.resource}
            action={perm.update}
            role={perm.role}
          >
            <Tooltip text="Khôi phục">
              <Button
                size="icon-sm"
                variant="outline-success"
                className="mb-0 mr-0"
                onClick={() => onRestore(row.original)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </PermissionGate>
        ),
        size: 80,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onRestore, cols, perm],
  );
}
