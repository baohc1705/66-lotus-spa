import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Switch } from "@/shared/forms/Switch";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { MutedCell, NameCell, TextCell } from "@/shared/tables/TableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";

import { SERVICE_CATEGORY_PERM } from "../constants/serviceCategory.permissions";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";
import type { UpdateServiceCategoryPayload } from "../schemas/serviceCategory.schema";

export const SERVICE_CATEGORY_COLUMN_LABELS = {
  icon: "Icon",
  imageUrl: "Ảnh",
  name: "Tên nhóm dịch vụ",
  description: "Mô tả",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;

interface UseActiveServiceCategoryColumnsParams {
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: ServiceCategoryDto) => void;
  onDelete: (item: ServiceCategoryDto) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    { id: number; payload: UpdateServiceCategoryPayload }
  >;
}

export function useActiveServiceCategoryColumns({
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
}: UseActiveServiceCategoryColumnsParams) {
  const cols = SERVICE_CATEGORY_COLUMN_LABELS;
  const perm = SERVICE_CATEGORY_PERM;

  return useMemo<ColumnDef<ServiceCategoryDto>[]>(
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
          const item = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={item.id !== undefined && selectedRowIds.has(item.id)}
                onChange={(checked: boolean) => {
                  if (item.id === undefined) return;
                  onToggleOne(item.id, checked);
                }}
                aria-label="Select row"
              />
            </div>
          );
        },
        size: 40,
        enableResizing: false,
      },
      {
        accessorKey: "icon",
        header: cols.icon,
        cell: ({ row }) => {
          const icon = row.original.icon;
          return (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
              {icon ? (
                <img src={icon} alt="" className="h-9 w-9 object-cover" />
              ) : (
                <span className="text-xs text-kit-muted">—</span>
              )}
            </div>
          );
        },
        size: 64,
        enableResizing: false,
      },
      {
        accessorKey: "imageUrl",
        header: cols.imageUrl,
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl;
          return (
            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-9 w-14 object-cover" />
              ) : (
                <span className="text-xs text-kit-muted">—</span>
              )}
            </div>
          );
        },
        size: 80,
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
        cell: ({ row }) => <NameCell value={row.original.name} />,
        size: 200,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 280,
      },
      {
        accessorKey: "sortOrder",
        header: () => (
          <SortableColumnHeader
            label={cols.sortOrder}
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
                onChange={(checked: boolean) => {
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
        size: 100,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
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
                    onClick={() => onEdit(item)}
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
                    onClick={() => onDelete(item)}
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
      cols,
      perm,
    ],
  );
}
