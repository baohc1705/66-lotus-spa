import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Switch } from "@/shared/forms/Switch";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { NameCell, MutedCell, TextCell } from "@/shared/tables/TableCells";
import { BOOKING_POSITION_PERM } from "../constants/booking_position.permissions";
import type {
  BookingPositionDTO,
  UpdateBookingPositionPayload,
} from "../types/booking_position.types";

export const BOOKING_POSITION_COLUMN_LABELS = {
  name: "Tên vị trí",
  roomName: "Phòng dịch vụ",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;

interface UseActiveBookingPositionColumnsParams {
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: BookingPositionDTO) => void;
  onDelete: (item: BookingPositionDTO) => void;
  updateMutation: {
    mutate: (variables: {
      id: number;
      payload: UpdateBookingPositionPayload;
    }) => void;
    isPending: boolean;
  };
}

export function useActiveBookingPositionColumns({
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
  updateMutation,
}: UseActiveBookingPositionColumnsParams) {
  const cols = BOOKING_POSITION_COLUMN_LABELS;
  const perm = BOOKING_POSITION_PERM;

  return useMemo<ColumnDef<BookingPositionDTO>[]>(
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
        size: 200,
      },
      {
        accessorKey: "roomName",
        header: cols.roomName,
        cell: ({ row }) => <TextCell value={row.original.roomName} />,
        size: 150,
      },
      {
        accessorKey: "sortOrder",
        header: () => (
          <SortableColumnHeader
            label={cols.sortOrder}
            column="sortOrder"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => <MutedCell value={row.original.sortOrder} />,
        size: 100,
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
        size: 120,
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
    [orderBy, isDescending, onSort, onEdit, onDelete, updateMutation, cols, perm],
  );
}
