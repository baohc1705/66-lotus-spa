import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { Switch } from "@/shared/forms/Switch";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { NameCell, TextCell } from "@/shared/tables/TableCells";
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
              <Badge variant="success" soft>
                Trống {available}
              </Badge>
              <Badge variant={inService > 0 ? "warning" : "secondary"} soft>
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
                onChange={(checked: boolean) => {
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
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
          const expanded = row.getIsExpanded();
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip text={expanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                <Button
                  size="icon-sm"
                  variant="outline-info"
                  className="mb-0 mr-0"
                  onClick={() => row.toggleExpanded()}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
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
    [orderBy, isDescending, onSort, onEdit, onDelete, updateMutation, cols, perm],
  );
}
