import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, CreditCard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { IndexCell } from "@/shared/components/DataTable/TableCells";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { formatDateTimeDisplay, formatDisplayDate } from "@/shared/utils/date.utils";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { MembershipCardDto } from "../types/membershipCard.types";

export const MEMBERSHIP_CARD_COLUMN_LABELS = {
  id: "Mã hệ thống",
  customerId: "Mã KH",
  cardCode: "Mã thẻ",
  customerName: "Khách hàng",
  membershipTierId: "Mã loại thẻ",
  tierName: "Hạng thẻ",
  issuedAt: "Ngày cấp",
  expiresAt: "Ngày hết hạn",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
} as const;

export const CARD_STATUS_MAP: StatusMap = {
  "1": { label: "Hoạt động", variant: "success", dot: true },
  "2": { label: "Hết hạn", variant: "warning" },
  "3": { label: "Đã thu hồi", variant: "error" },
};

interface UseActiveMembershipCardColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: MembershipCardDto) => void;
}

export function useActiveMembershipCardColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
}: UseActiveMembershipCardColumnsParams) {
  const cols = MEMBERSHIP_CARD_COLUMN_LABELS;
  const perm = CUSTOMER_PERM;

  return useMemo<ColumnDef<MembershipCardDto>[]>(
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
        accessorKey: "id",
        header: cols.id,
        cell: ({ row }) => (
          <span className="text-2xs font-mono font-bold text-adminGray-600">
            #{row.original.id}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "customerId",
        header: cols.customerId,
        cell: ({ row }) => (
          <span className="text-2xs font-mono text-adminGray-600">
            #{row.original.customerId}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "cardCode",
        header: () => (
          <SortableColumnHeader
            label={cols.cardCode}
            column="cardCode"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-adminGold-600" />
            <span className="font-bold text-adminInk">
              {row.original.cardCode}
            </span>
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: "customerName",
        header: cols.customerName,
        cell: ({ row }) => (
          <span className="font-semibold text-adminInk/80">
            {row.original.customerName ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "membershipTierId",
        header: cols.membershipTierId,
        cell: ({ row }) => (
          <span className="text-2xs font-mono text-adminGray-600">
            #{row.original.membershipTierId}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "tierName",
        header: cols.tierName,
        cell: ({ row }) => (
          <span className="text-adminInk/80 font-medium">
            {row.original.tierName ?? "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "issuedAt",
        header: cols.issuedAt,
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-sm">
            {row.original.issuedAt
              ? formatDisplayDate(row.original.issuedAt)
              : "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "expiresAt",
        header: cols.expiresAt,
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-sm">
            {row.original.expiresAt
              ? formatDisplayDate(row.original.expiresAt)
              : "Vĩnh viễn"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status)}
            statusMap={CARD_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: cols.createdAt,
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-sm">
            {formatDateTimeDisplay(row.original.createdAt)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "updatedAt",
        header: cols.updatedAt,
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-sm">
            {formatDateTimeDisplay(row.original.updatedAt)}
          </span>
        ),
        size: 110,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const card = row.original;
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
                    <DropdownMenuItem onClick={() => onEdit(card)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {COMMON_MSG.edit}
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
    [pageIndex, pageSize, orderBy, isDescending, onSort, onEdit, cols, perm],
  );
}

export type MembershipCardTableRow = Row<MembershipCardDto>;
