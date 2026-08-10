import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { IndexCell } from "@/shared/tables/TableCells";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import { TIME_SLOT_PERM } from "../constants/time_slot.permissions";
import type { TimeSlotDTO } from "../types/time_slot.types";

export const TIME_SLOT_COLUMN_LABELS = {
  startTime: "Thời gian bắt đầu",
  endTime: "Thời gian kết thúc",
} as const;

interface UseActiveTimeSlotColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: TimeSlotDTO) => void;
  onDelete: (item: TimeSlotDTO) => void;
}

export function useActiveTimeSlotColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
}: UseActiveTimeSlotColumnsParams) {
  const cols = TIME_SLOT_COLUMN_LABELS;
  const perm = TIME_SLOT_PERM;

  return useMemo<ColumnDef<TimeSlotDTO>[]>(
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
        accessorKey: "startTime",
        header: () => (
          <SortableColumnHeader
            label={cols.startTime}
            column="startTime"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
            {toLocalTimeOnly(row.original.startTime) || "—"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "endTime",
        header: () => (
          <SortableColumnHeader
            label={cols.endTime}
            column="endTime"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
            {toLocalTimeOnly(row.original.endTime) || "—"}
          </span>
        ),
        size: 200,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PermissionGate resource={perm.resource} action={perm.update}>
                <Tooltip text="Sửa">
                  <Button
                    size="icon-sm"
                    variant="outline-primary"
                    className="mb-0 mr-0"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
              <PermissionGate resource={perm.resource} action={perm.delete}>
                <Tooltip text="Xóa">
                  <Button
                    size="icon-sm"
                    variant="outline-danger"
                    className="mb-0 mr-0"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
            </div>
          );
        },
        size: 100,
        enableResizing: false,
      },
    ],
    [
      pageIndex,
      pageSize,
      orderBy,
      isDescending,
      onSort,
      onEdit,
      onDelete,
      cols,
      perm,
    ],
  );
}
