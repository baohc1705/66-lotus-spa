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
import { CONFIG_APPOINTMENT_PERM } from "../constants/config_appointment.permissions";
import type { ConfigAppointmentDTO } from "../types/config_appointment.types";

export const CONFIG_APPOINTMENT_COLUMN_LABELS = {
  salonName: "Chi nhánh",
  depositPercent: "Phần trăm cọc",
  startTime: "Giờ mở",
  endTime: "Giờ đóng",
  slotMinutes: "Phút/khung",
} as const;

interface UseActiveConfigAppointmentColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: ConfigAppointmentDTO) => void;
  onDelete: (item: ConfigAppointmentDTO) => void;
}

export function useActiveConfigAppointmentColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
}: UseActiveConfigAppointmentColumnsParams) {
  const cols = CONFIG_APPOINTMENT_COLUMN_LABELS;
  const perm = CONFIG_APPOINTMENT_PERM;

  const formatDisplayTime = (t?: string | null) => {
    if (!t) return "—";
    return t.substring(0, 5);
  };

  return useMemo<ColumnDef<ConfigAppointmentDTO>[]>(
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
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {row.original.salonName ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "depositPercent",
        header: () => (
          <SortableColumnHeader
            label={cols.depositPercent}
            column="depositPercent"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk">
            {row.original.depositPercent != null
              ? `${row.original.depositPercent}%`
              : "—"}
          </span>
        ),
        size: 120,
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
          <span className="text-adminInk">
            {formatDisplayTime(row.original.startTime)}
          </span>
        ),
        size: 100,
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
          <span className="text-adminInk">
            {formatDisplayTime(row.original.endTime)}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "slotMinutes",
        header: () => (
          <SortableColumnHeader
            label={cols.slotMinutes}
            column="slotMinutes"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <span className="text-adminInk">
            {row.original.slotMinutes != null
              ? `${row.original.slotMinutes} phút`
              : "—"}
          </span>
        ),
        size: 110,
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
                      Xóa cấu hình
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
