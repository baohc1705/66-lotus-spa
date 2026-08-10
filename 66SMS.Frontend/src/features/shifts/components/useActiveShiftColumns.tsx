import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { IndexCell, NameCell } from "@/shared/tables/TableCells";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import { SHIFT_PERM } from "../constants/shift.permissions";
import type { ShiftDTO } from "../types/shift.types";

export const SHIFT_COLUMN_LABELS = {
  name: "Tên ca",
  salonName: "Chi nhánh",
  time: "Giờ làm việc",
} as const;

interface UseActiveShiftColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: ShiftDTO) => void;
  onDelete: (item: ShiftDTO) => void;
}

export function useActiveShiftColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
}: UseActiveShiftColumnsParams) {
  const cols = SHIFT_COLUMN_LABELS;
  const perm = SHIFT_PERM;

  return useMemo<ColumnDef<ShiftDTO>[]>(
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
        accessorKey: "name",
        header: () => (
          <SortableColumnHeader
            label={cols.name}
            column="name"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 150,
      },
      {
        accessorKey: "salonName",
        header: () => (
          <SortableColumnHeader
            label={cols.salonName}
            column="salonName"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.salonName} />,
        size: 180,
      },
      {
        id: "time",
        header: cols.time,
        cell: ({ row }) => {
          const shift = row.original;
          if (!shift.shiftStart || !shift.shiftEnd) return "—";
          return (
            <div className="flex items-center gap-1.5 text-kit-heading">
              <Clock className="h-4 w-4 text-kit-muted" />
              <span>
                {toLocalTimeOnly(shift.shiftStart)} -{" "}
                {toLocalTimeOnly(shift.shiftEnd)}
              </span>
            </div>
          );
        },
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
        size: 120,
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
