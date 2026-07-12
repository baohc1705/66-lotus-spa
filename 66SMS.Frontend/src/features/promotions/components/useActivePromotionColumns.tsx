import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { IndexCell, PriceCell } from "@/shared/components/DataTable/tableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
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

const PROMOTION_STATUS_MAP: StatusMap = {
  "1": { label: "Hoạt động", variant: "success", dot: true },
  "0": { label: "Không HĐ", variant: "error" },
};

const DISCOUNT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  "1": { label: "Giảm %", color: "bg-state-info-bg text-state-info-text" },
  "2": { label: "Giảm tiền", color: "bg-state-warning-bg text-state-warning-text" },
  "3": { label: "Mua X tặng Y", color: "bg-adminGold-100 text-adminGold-700" },
};

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
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-adminInk">
            {row.original.code ?? "—"}
          </span>
        ),
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
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-adminInk truncate max-w-[200px] block">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 220,
      },
      {
        accessorKey: "discountType",
        header: cols.discountType,
        cell: ({ row }) => {
          const type = row.original.discountType?.toString() ?? "";
          const info = DISCOUNT_TYPE_MAP[type];
          if (!info) return <span className="text-adminGray-600">—</span>;
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${info.color}`}
            >
              {info.label}
            </span>
          );
        },
        size: 120,
      },
      {
        id: "discountValue",
        header: cols.discountValue,
        cell: ({ row }) => {
          const p = row.original;
          if (p.discountType === 1)
            return <span className="text-adminInk">{p.discountValue ?? 0}%</span>;
          if (p.discountType === 2)
            return <PriceCell value={p.discountValue} />;
          if (p.discountType === 3)
            return (
              <span className="text-adminInk">
                Mua {p.buyQuantity} tặng {p.getQuantity}
              </span>
            );
          return <span>—</span>;
        },
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
          const p = row.original;
          return (
            <div className="text-xs text-adminInk/70 leading-5">
              <div>{p.startDate ?? "—"}</div>
              <div>→ {p.endDate ?? "—"}</div>
            </div>
          );
        },
        size: 170,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status?.toString() ?? null}
            statusMap={PROMOTION_STATUS_MAP}
          />
        ),
        size: 110,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
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
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Pencil className="w-4 h-4" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate resource={perm.resource} action={perm.delete}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
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
