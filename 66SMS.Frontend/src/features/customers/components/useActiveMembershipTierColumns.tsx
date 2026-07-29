import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, Crown } from "lucide-react";
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
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { formatCurrency } from "@/shared/utils/currency";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { MembershipTierDto } from "../types/membershipTier.types";

export const MEMBERSHIP_TIER_COLUMN_LABELS = {
  name: "Loại thẻ",
  minSpending: "Chi tiêu tối thiểu",
  discountPercent: "Giảm giá",
  pointMultiplier: "Hệ số điểm",
  status: "Trạng thái",
} as const;

export const TIER_STATUS_MAP: StatusMap = {
  "0": { label: "Ngưng hoạt động", variant: "error" },
  "1": { label: "Hoạt động", variant: "success", dot: true },
  "2": { label: "Tạm khóa", variant: "warning" },
};

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
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-adminGold-600" />
            <span className="font-bold text-adminInk">{row.original.name}</span>
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
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk/80">
            {formatCurrency(row.original.minSpending)}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "discountPercent",
        header: cols.discountPercent,
        cell: ({ row }) => (
          <span className="text-adminInk/80 font-medium">
            {row.original.discountPercent ?? 0}%
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "pointMultiplier",
        header: cols.pointMultiplier,
        cell: ({ row }) => (
          <span className="text-adminInk/80 font-medium">
            x{row.original.pointMultiplier}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status)}
            statusMap={TIER_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const tier = row.original;
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
                    <DropdownMenuItem onClick={() => onEdit(tier)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate resource={perm.resource} action={perm.delete}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(tier)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa loại thẻ
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

export type MembershipTierTableRow = Row<MembershipTierDto>;
