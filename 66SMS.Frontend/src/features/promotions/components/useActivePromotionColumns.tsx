import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  IndexCell,
  MutedSmallCell,
  NameCell,
  PriceCell,
  TextCell,
} from "@/shared/tables/TableCells";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";

import { PROMOTION_PERM } from "../constants/promotion.permissions";
import type { PromotionDto } from "../types/promotion.types";

export const PROMOTION_COLUMN_LABELS = {
  code: "Mã KM",
  name: "Tên chương trình",
  discountType: "Kiểu giảm",
  discountValue: "Giá trị",
  period: "Hiệu lực",
  status: "Trạng thái",
} as const;

function discountTypeBadge(discountType: number | null | undefined) {
  if (discountType === 1) {
    return (
      <Badge variant="info" soft>
        Giảm %
      </Badge>
    );
  }
  if (discountType === 2) {
    return (
      <Badge variant="warning" soft>
        Giảm tiền
      </Badge>
    );
  }
  if (discountType === 3) {
    return (
      <Badge variant="primary" soft>
        Mua X tặng Y
      </Badge>
    );
  }
  return <TextCell value={null} />;
}

function statusBadge(status: number | null | undefined) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Hoạt động
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Không HĐ
    </Badge>
  );
}

function renderDiscountValue(promotion: PromotionDto) {
  if (promotion.discountType === 1) {
    return <TextCell value={`${promotion.discountValue ?? 0}%`} />;
  }
  if (promotion.discountType === 2) {
    return <PriceCell value={promotion.discountValue} />;
  }
  if (promotion.discountType === 3) {
    return (
      <TextCell
        value={`Mua ${promotion.buyQuantity} tặng ${promotion.getQuantity}`}
      />
    );
  }
  return <TextCell value={null} />;
}

interface UseActivePromotionColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  onEdit: (item: PromotionDto) => void;
  onDelete: (item: PromotionDto) => void;
}

export function useActivePromotionColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  onEdit,
  onDelete,
}: UseActivePromotionColumnsParams) {
  const cols = PROMOTION_COLUMN_LABELS;
  const perm = PROMOTION_PERM;

  return useMemo<ColumnDef<PromotionDto>[]>(
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
        header: () => (
          <SortableColumnHeader
            label={cols.code}
            column="code"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.code} />,
        size: 120,
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
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 220,
      },
      {
        accessorKey: "discountType",
        header: cols.discountType,
        cell: ({ row }) => discountTypeBadge(row.original.discountType),
        size: 120,
      },
      {
        id: "discountValue",
        header: cols.discountValue,
        cell: ({ row }) => renderDiscountValue(row.original),
        size: 140,
      },
      {
        id: "period",
        header: () => (
          <SortableColumnHeader
            label={cols.period}
            column="startdate"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => {
          const promotion = row.original;
          return (
            <div className="leading-5">
              <MutedSmallCell
                value={formatDateTimeDisplay(promotion.startDate)}
              />
              <div>
                <MutedSmallCell
                  value={`đến ${formatDateTimeDisplay(promotion.endDate)}`}
                />
              </div>
            </div>
          );
        },
        size: 170,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => statusBadge(row.original.status),
        size: 110,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const promotion = row.original;
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
                    onClick={() => onEdit(promotion)}
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
                    onClick={() => onDelete(promotion)}
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
