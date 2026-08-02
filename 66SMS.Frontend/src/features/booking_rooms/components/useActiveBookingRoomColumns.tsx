import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import {
  IndexCell,
  NameCell,
  TextCell,
} from "@/shared/components/DataTable/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { BOOKING_ROOM_PERM } from "../constants/booking_room.permissions";
import type {
  BookingRoomDTO,
  UpdateBookingRoomPayload,
} from "../types/booking_room.types";

export const BOOKING_ROOM_COLUMN_LABELS = {
  name: "Tên phòng",
  salonName: "Chi nhánh",
  note: "Ghi chú",
  occupancy: "Vị trí",
  status: "Hoạt động",
} as const;

interface UseActiveBookingRoomColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: BookingRoomDTO) => void;
  onDelete: (item: BookingRoomDTO) => void;
  updateMutation: {
    mutate: (variables: {
      id: number;
      payload: UpdateBookingRoomPayload;
    }) => void;
    isPending: boolean;
  };
}

export function useActiveBookingRoomColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
  updateMutation,
}: UseActiveBookingRoomColumnsParams) {
  const cols = BOOKING_ROOM_COLUMN_LABELS;
  const perm = BOOKING_ROOM_PERM;

  return useMemo<ColumnDef<BookingRoomDTO>[]>(
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
        size: 180,
      },
      {
        accessorKey: "salonName",
        header: cols.salonName,
        cell: ({ row }) => <TextCell value={row.original.salonName} />,
        size: 180,
      },
      {
        accessorKey: "note",
        header: cols.note,
        cell: ({ row }) => <TextCell value={row.original.note} />,
        size: 220,
      },
      {
        id: "occupancy",
        header: cols.occupancy,
        cell: ({ row }) => {
          const available = row.original.availableCount ?? 0;
          const inService = row.original.inServiceCount ?? 0;
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="success" size="sm" dot>
                Trống {available}
              </Badge>
              <Badge
                variant={inService > 0 ? "warning" : "neutral"}
                size="sm"
                dot
              >
                Đang phục vụ {inService}
              </Badge>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Switch
                checked={item.status === 1}
                onCheckedChange={(checked) => {
                  if (item.id) {
                    updateMutation.mutate({
                      id: item.id,
                      payload: {
                        status: checked ? 1 : 0,
                      },
                    });
                  }
                }}
                disabled={updateMutation.isPending}
              />
            </div>
          );
        },
        size: 100,
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
                  <PermissionGate resource={perm.resource} action={perm.delete}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa phòng
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
      updateMutation,
      cols,
      perm,
    ],
  );
}
