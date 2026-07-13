import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import {
  IndexCell,
  MutedCell,
  TextCell,
} from "@/shared/components/DataTable/tableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { Result } from "@/shared/types/common.types";

import { SERVICE_CATEGORY_PERM } from "../constants/serviceCategory.permissions";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";
import type { UpdateServiceCategoryPayload } from "../schemas/serviceCategory.schema";

export const SERVICE_CATEGORY_COLUMN_LABELS = {
  name: "Tên nhóm dịch vụ",
  description: "Mô tả",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;

interface UseActiveServiceCategoryColumnsParams {
  pageIndex: number;
  pageSize: number;
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
  pageIndex,
  pageSize,
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
              checked={item.id !== undefined && selectedRowIds.has(item.id)}
              onCheckedChange={(checked) => {
                if (item.id === undefined) return;
                onToggleOne(item.id, checked === true);
              }}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 40,
        enableResizing: false,
      },
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
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGold-600/10 flex items-center justify-center shrink-0 overflow-hidden">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-state-warning-text">
                    {(item.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[160px]">
                {item.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "description",
        header: cols.description,
        cell: ({ row }) => <TextCell value={row.original.description} />,
        size: 300,
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
                  <PermissionGate
                    resource={perm.resource}
                    action={perm.update}
                  >
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
                      Xóa nhóm
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
