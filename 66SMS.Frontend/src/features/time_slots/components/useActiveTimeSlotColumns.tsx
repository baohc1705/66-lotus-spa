import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { IndexCell } from "@/shared/components/DataTable/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
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

  const formatDisplayTime = (t?: string) => {
    if (!t) return "—";
    return t.substring(0, 5);
  };

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
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {formatDisplayTime(row.original.startTime)}
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
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {formatDisplayTime(row.original.endTime)}
          </span>
        ),
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
                      Xóa khung giờ
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
