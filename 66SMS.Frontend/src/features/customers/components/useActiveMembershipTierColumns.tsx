import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Crown, Eye, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  IndexCell,
  NameCell,
  PriceCell,
  TextCell,
} from "@/shared/tables/TableCells";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { MembershipTierDto } from "../types/membershipTier.types";

export const MEMBERSHIP_TIER_COLUMN_LABELS = {
  name: "Loại thẻ",
  minSpending: "Chi tiêu tối thiểu",
  discountPercent: "Giảm giá",
  pointMultiplier: "Hệ số điểm",
  status: "Trạng thái",
} as const;

function tierStatusBadge(status: number) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Hoạt động
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge variant="warning" soft>
        Tạm khóa
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Ngưng hoạt động
    </Badge>
  );
}

interface UseActiveMembershipTierColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: MembershipTierDto) => void;
  onDelete: (item: MembershipTierDto) => void;
}

export function useActiveMembershipTierColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
}: UseActiveMembershipTierColumnsParams) {
  const cols = MEMBERSHIP_TIER_COLUMN_LABELS;
  const perm = CUSTOMER_PERM;

  return useMemo<ColumnDef<MembershipTierDto>[]>(
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-kit-primary" />
            <NameCell value={row.original.name} />
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: "minSpending",
        header: () => (
          <SortableColumnHeader
            label={cols.minSpending}
            column="minSpending"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => <PriceCell value={row.original.minSpending} />,
        size: 150,
      },
      {
        accessorKey: "discountPercent",
        header: cols.discountPercent,
        cell: ({ row }) => (
          <TextCell value={`${row.original.discountPercent ?? 0}%`} />
        ),
        size: 100,
      },
      {
        accessorKey: "pointMultiplier",
        header: cols.pointMultiplier,
        cell: ({ row }) => (
          <TextCell value={`x${row.original.pointMultiplier}`} />
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => tierStatusBadge(row.original.status),
        size: 120,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const tier = row.original;
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
                    onClick={() => onEdit(tier)}
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
                    onClick={() => onDelete(tier)}
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
