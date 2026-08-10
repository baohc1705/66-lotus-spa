import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  IndexCell,
  NameCell,
  TextCell,
  MutedSmallCell,
} from "@/shared/tables/TableCells";
import { SalonStatusBadge } from "./SalonStatusBadge";
import { SALON_PERM } from "../constants/salon.permissions";
import type { SalonListItem } from "../types/salon.types";

export const SALON_COLUMN_LABELS = {
  code: "Mã",
  name: "Tên chi nhánh",
  phone: "Số điện thoại",
  fullAddress: "Địa chỉ",
  isPrimary: "Trụ sở chính",
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
        cell: ({ row }) => <MutedSmallCell value={row.original.code} />,
        size: 100,
      },
      {
        accessorKey: "name",
        header: cols.name,
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 200,
      },
      {
        accessorKey: "phone",
        header: cols.phone,
        cell: ({ row }) => <TextCell value={row.original.phone} />,
        size: 130,
      },
      {
        accessorKey: "fullAddress",
        header: cols.fullAddress,
        cell: ({ row }) => (
          <TextCell
            value={row.original.fullAddress || row.original.streetAddress}
          />
        ),
        size: 260,
      },
      {
        accessorKey: "isPrimary",
        header: cols.isPrimary,
        cell: ({ row }) =>
          row.original.isPrimary ? (
            <Badge variant="success" soft>
              Trụ sở chính
            </Badge>
          ) : (
            <span className="text-xs text-kit-muted">—</span>
          ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => <SalonStatusBadge status={row.original.status} />,
        size: 120,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const salon = row.original;
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
                    onClick={() => onEdit(salon)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
              <PermissionGate
                resource={perm.resource}
                action={perm.delete}
                role={perm.role}
              >
                <Tooltip text="Xóa">
                  <Button
                    size="icon-sm"
                    variant="outline-danger"
                    className="mb-0 mr-0"
                    onClick={() => onDelete(salon)}
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
    [pageIndex, pageSize, onEdit, onDelete, cols, perm],
  );
}

export type SalonTableRow = Row<SalonListItem>;
