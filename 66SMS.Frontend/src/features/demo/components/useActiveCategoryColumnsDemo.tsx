import type { UseMutationResult } from "@tanstack/react-query";
import type {
  ProductCategoryDemo,
  UpdateProductCategoryPayloadDemo,
} from "../types/productCategoryDemo.type";
import type { Result } from "@/shared/types/common.types";
import { PRODUCT_CATEGORY_DEMO_PERM } from "../constants/productCategoryDemo.permissions";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/shared/forms/Checkbox";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { MutedCell, NameCell, TextCell } from "@/shared/tables/TableCells";
import { Switch } from "@/shared/forms/Switch";
import { StatusActive } from "@/shared/constants/status.enum";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { Pencil, Trash2 } from "lucide-react";
export const CATEGORY_COLUMN_LABELS_DEMO = {
  name: "Tên danh mục",
  description: "Mô tả",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;
interface UseActiveCategoryColumnsDemoParams {
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: ProductCategoryDemo) => void;
  onDelete: (item: ProductCategoryDemo) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    { id: number; payload: UpdateProductCategoryPayloadDemo }
  >;
}

export function useActiveCategoryColumnsDemo({
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
}: UseActiveCategoryColumnsDemoParams) {
  return useMemo<ColumnDef<ProductCategoryDemo>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              className="mb-0"
              checked={headerChecked === true}
              indeterminate={headerChecked === "indeterminate"}
              onChange={(checked: boolean) => onToggleAll(checked)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={
                  row.original.id != undefined &&
                  selectedRowIds.has(row.original.id)
                }
                onChange={(checked: boolean) => {
                  if (row.original.id == undefined) return;
                  onToggleOne(row.original.id, checked);
                }}
                aria-label="Select one"
              />
            </div>
          );
        },
        size: 40,
        enableResizing: true,
      },
      {
        accessorKey: "name",
        header: () => (
          <SortableColumnHeader
            label={"Tên danh mục"}
            column="name"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 200,
        enableResizing: true,
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 280,
        enableResizing: true,
      },
      {
        accessorKey: "sortOrder",
        header: () => (
          <SortableColumnHeader
            label="Thứ tự"
            column="sortOrder"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
            onPrimary
          />
        ),
        cell: ({ row }) => <MutedCell value={row.original.sortOrder} />,
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Switch
                checked={row.original.status === StatusActive.Active}
                onChange={(check: boolean) => {
                  if (row.original.id) {
                    updateMutation.mutate({
                      id: row.original.id,
                      payload: {
                        status: check
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
        size: 100,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PermissionGate
                resource={PRODUCT_CATEGORY_DEMO_PERM.resource}
                action={PRODUCT_CATEGORY_DEMO_PERM.update}
              >
                <Tooltip text="Sửa">
                  <Button
                    size="icon-sm"
                    variant="outline-primary"
                    className="mb-0 mr-0"
                    onClick={() => onEdit(row.original)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
              <PermissionGate
                resource={PRODUCT_CATEGORY_DEMO_PERM.resource}
                action={PRODUCT_CATEGORY_DEMO_PERM.delete}
              >
                <Tooltip text="Xóa">
                  <Button
                    size="icon-sm"
                    variant="outline-danger"
                    className="mb-0 mr-0"
                    onClick={() => onDelete(row.original)}
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
    ],
  );
}
