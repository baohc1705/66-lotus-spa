import type { UseMutationResult } from "@tanstack/react-query";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { MutedCell, PriceCell, TextCell } from "@/shared/components/DataTable/TableCells";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Switch } from "@/shared/components/ui/switch";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";

import { PRODUCT_PERM } from "../constants/product.permissions";
import type { UpdateProductPayload } from "../schemas/product.schema";
import type { ProductDto } from "../types/product.types";

export const PRODUCT_COLUMN_LABELS = {
  code: "Mã SP",
  name: "Tên sản phẩm",
  categoryName: "Danh mục",
  stockQuantity: "Tồn kho",
  unit: "Đơn vị",
  sellingPrice: "Giá bán",
  status: "Trạng thái",
} as const;

interface UseActiveProductColumnsParams {
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: ProductDto) => void;
  onDelete: (item: ProductDto) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    { id: number; payload: UpdateProductPayload }
  >;
}



export function useActiveProductColumns({
  orderBy,
  isDescending,
  onSort,
  headerChecked,
  selectedRowIds,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
  updateMutation,
}: UseActiveProductColumnsParams) {
  const cols = PRODUCT_COLUMN_LABELS;
  const perm = PRODUCT_PERM;

  return useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={headerChecked}
            onCheckedChange={onToggleAll}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Checkbox
              checked={item.id != null && selectedRowIds.has(item.id)}
              onCheckedChange={(checked) => {
                if (item.id == null) return;
                onToggleOne(item.id, checked === true);
              }}
              aria-label={`Chọn ${item.name ?? "sản phẩm"}`}
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 40,
        enableResizing: false,
      },
      {
        accessorKey: "code",
        header: cols.code,
        cell: ({ row }) => (
          <span className="text-adminInk/80 font-medium">
            {row.original.code ?? "—"}
          </span>
        ),
        size: 100,
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
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {prod.imageUrl ? (
                  <img
                    src={prod.imageUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <Package className="w-4 h-4 text-adminGray-400" />
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[180px]">
                {prod.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <TextCell value={row.original.categoryName} />,
        size: 120,
      },
      {
        accessorKey: "stockQuantity",
        header: () => (
          <SortableColumnHeader
            label={cols.stockQuantity}
            column="stockquantity"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => {
          const stock = row.original.stockQuantity ?? 0;
          const minStock = row.original.minStock ?? 0;
          const isLowStock = stock <= minStock;
          return (
            <span
              className={`font-semibold ${isLowStock ? "text-state-danger-text" : "text-adminInk"}`}
            >
              {stock}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "unit",
        header: cols.unit,
        cell: ({ row }) => <MutedCell value={row.original.unit} />,
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 120,
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
                checked={item.status === StatusActive.Active}
                onCheckedChange={(checked) => {
                  if (item.id) {
                    updateMutation.mutate({
                      id: item.id,
                      payload: {
                        status: checked
                          ? StatusActive.Active
                          : StatusActive.Inactive,
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
        header: "",
        cell: ({ row }) => {
          const item = row.original;
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
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="w-4 h-4" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate
                    resource={perm.resource}
                    action={perm.delete}
                    role={perm.role}
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa sản phẩm
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
      orderBy,
      isDescending,
      onSort,
      headerChecked,
      selectedRowIds,
      onToggleAll,
      onToggleOne,
      onEdit,
      onDelete,
      updateMutation,
      cols,
      perm,
    ],
  );
}

export type ProductTableRow = Row<ProductDto>;
