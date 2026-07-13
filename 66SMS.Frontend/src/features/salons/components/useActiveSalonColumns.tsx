import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { IndexCell } from "@/shared/components/DataTable/tableCells";
import { SalonStatusBadge } from "./SalonStatusBadge";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { SALON_PERM } from "../constants/salon.permissions";
import type { SalonListItem } from "../types/salon.types";

export const SALON_COLUMN_LABELS = {
  code: "Mã",
  name: "Tên chi nhánh",
  phone: "Số điện thoại",
  fullAddress: "Địa chỉ",
  status: "Trạng thái",
} as const;

interface UseActiveSalonColumnsParams {
  pageIndex: number;
  pageSize: number;
  onEdit: (item: SalonListItem) => void;
  onDelete: (item: SalonListItem) => void;
}

export function useActiveSalonColumns({
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
}: UseActiveSalonColumnsParams) {
  const cols = SALON_COLUMN_LABELS;
  const perm = SALON_PERM;

  return useMemo<ColumnDef<SalonListItem>[]>(
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
          <span className="text-xs bg-adminGray-100 px-1.5 py-0.5 rounded text-adminInk">
            {row.original.code}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => (
          <span className="font-bold text-adminInk">{row.original.name}</span>
        ),
        size: 200,
      },
      {
        accessorKey: "phone",
        header: cols.phone,
        cell: ({ row }) => (
          <span className="text-adminInk/80">{row.original.phone}</span>
        ),
        size: 130,
      },
      {
        accessorKey: "fullAddress",
        header: cols.fullAddress,
        cell: ({ row }) => (
          <span
            className="text-adminInk/70 text-xs block truncate"
            style={{ maxWidth: 250 }}
            title={row.original.fullAddress}
          >
            {row.original.fullAddress || row.original.streetAddress || "—"}
          </span>
        ),
        size: 260,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => <SalonStatusBadge status={row.original.status} />,
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const salon = row.original;
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
                    <Eye className="w-4 h-4 mr-2" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(salon)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate resource={perm.resource} action={perm.delete} role={perm.role}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(salon)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa chi nhánh
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
    [pageIndex, pageSize, onEdit, onDelete, cols, perm],
  );
}

export type SalonTableRow = Row<SalonListItem>;
