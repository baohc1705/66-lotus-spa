import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  IndexCell,
  NameCell,
  TextCell,
} from "@/shared/tables/TableCells";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";

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
            onPrimary
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.salonName} />,
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
        cell: ({ row }) => {
          const depositPercent = row.original.depositPercent;
          if (depositPercent == null) return <TextCell value={null} />;
          return <TextCell value={`${depositPercent}%`} />;
        },
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
        cell: ({ row }) => {
          const time = toLocalTimeOnly(row.original.startTime);
          return <TextCell value={time || null} />;
        },
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
        cell: ({ row }) => {
          const time = toLocalTimeOnly(row.original.endTime);
          return <TextCell value={time || null} />;
        },
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
        cell: ({ row }) => {
          const slotMinutes = row.original.slotMinutes;
          if (slotMinutes == null) return <TextCell value={null} />;
          return <TextCell value={`${slotMinutes} phút`} />;
        },
        size: 110,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(event) => event.stopPropagation()}
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
