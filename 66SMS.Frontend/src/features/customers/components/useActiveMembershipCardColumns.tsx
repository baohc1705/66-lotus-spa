import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Eye, Pencil } from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedSmallCell,
  NameCell,
  TextCell,
} from "@/shared/tables/TableCells";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { MembershipCardDto } from "../types/membershipCard.types";

export const MEMBERSHIP_CARD_COLUMN_LABELS = {
  id: "Mã hệ thống",
  customerId: "Mã khách",
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

function cardStatusBadge(status: number) {
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
        Hết hạn
      </Badge>
    );
  }
  if (status === 3) {
    return (
      <Badge variant="danger" soft>
        Đã thu hồi
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Không rõ
    </Badge>
  );
}

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
        cell: ({ row }) => <MutedSmallCell value={`#${row.original.id}`} />,
        size: 80,
      },
      {
        accessorKey: "customerId",
        header: cols.customerId,
        cell: ({ row }) => (
          <MutedSmallCell value={`#${row.original.customerId}`} />
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
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-kit-primary" />
            <NameCell value={row.original.cardCode} />
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: "customerName",
        header: cols.customerName,
        cell: ({ row }) => <NameCell value={row.original.customerName} />,
        size: 180,
      },
      {
        accessorKey: "membershipTierId",
        header: cols.membershipTierId,
        cell: ({ row }) => (
          <MutedSmallCell
            value={
              row.original.membershipTierId != null
                ? `#${row.original.membershipTierId}`
                : null
            }
          />
        ),
        size: 80,
      },
      {
        accessorKey: "tierName",
        header: cols.tierName,
        cell: ({ row }) => <TextCell value={row.original.tierName} />,
        size: 120,
      },
      {
        accessorKey: "issuedAt",
        header: cols.issuedAt,
        cell: ({ row }) => (
          <TextCell
            value={
              row.original.issuedAt
                ? formatDisplayDate(row.original.issuedAt)
                : null
            }
          />
        ),
        size: 110,
      },
      {
        accessorKey: "expiresAt",
        header: cols.expiresAt,
        cell: ({ row }) => (
          <TextCell
            value={
              row.original.expiresAt
                ? formatDisplayDate(row.original.expiresAt)
                : "Vĩnh viễn"
            }
          />
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => cardStatusBadge(row.original.status),
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: cols.createdAt,
        cell: ({ row }) => <DateTimeCell value={row.original.createdAt} />,
        size: 110,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const card = row.original;
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
                    onClick={() => onEdit(card)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
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
    [pageIndex, pageSize, orderBy, isDescending, onSort, onEdit, cols, perm],
  );
}
