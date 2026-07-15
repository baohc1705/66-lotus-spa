import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { IndexCell, NameCell } from "@/shared/components/DataTable/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { SHIFT_PERM } from "../constants/shift.permissions";
import type { ShiftDTO } from "../types/shift.types";

export const SHIFT_COLUMN_LABELS = {
  name: "Tên ca",
  time: "Giờ làm việc",
  effective: "Hiệu lực",
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
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 150,
      },
      {
        id: "time",
        header: cols.time,
        cell: ({ row }) => {
          const currentPeriod = row.original.shiftPeriodDTOs?.[0];
          if (!currentPeriod) return "—";
          return (
            <div className="flex items-center gap-1.5 text-adminInk/90">
              <Clock className="w-4 h-4 text-adminGray-600" />
              <span>
                {currentPeriod.shiftStart?.substring(0, 5)} -{" "}
                {currentPeriod.shiftEnd?.substring(0, 5)}
              </span>
            </div>
          );
        },
        size: 200,
      },
      {
        id: "effective",
        header: cols.effective,
        cell: ({ row }) => {
          const currentPeriod = row.original.shiftPeriodDTOs?.[0];
          if (!currentPeriod) return "—";
          const from = formatDisplayDate(currentPeriod.effectiveFrom) || "—";
          const to = currentPeriod.effectiveTo
            ? formatDisplayDate(currentPeriod.effectiveTo)
            : "Vô thời hạn";
          return (
            <span className="text-adminInk/80 text-sm">
              {from} - {to}
            </span>
          );
        },
        size: 200,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="w-4 h-4" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate
                    resource={perm.resource}
                    action={perm.delete}
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa ca
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
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
