import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

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
  DateTimeCell,
  IndexCell,
  MutedCell,
  PriceCell,
} from "@/shared/components/DataTable/tableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { Result } from "@/shared/types/common.types";

import { SERVICE_PERM } from "../constants/service.permissions";
import type { ServiceListDto } from "../types/service.types";
import type { UpdateServicePayload } from "../schemas/service.schema";

export const SERVICE_COLUMN_LABELS = {
  code: "Mã DV",
  name: "Tên dịch vụ",
  categoryName: "Nhóm dịch vụ",
  costPrice: "Giá cơ bản",
  sellingPrice: "Giá bán",
  durationMins: "Thời gian",
  status: "Trạng thái",
} as const;

interface UseActiveServiceColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: ServiceListDto) => void;
  onDelete: (item: ServiceListDto) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    { id: number; payload: UpdateServicePayload }
  >;
}



export function useActiveServiceColumns({
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
}: UseActiveServiceColumnsParams) {
  const cols = SERVICE_COLUMN_LABELS;
  const perm = SERVICE_PERM;

  return useMemo<ColumnDef<ServiceListDto>[]>(
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
          <span className="font-mono text-xs px-2 py-1 bg-adminGray-100 rounded text-adminGray-600">
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
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-adminGold-600/10 flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-state-warning-text">
                    {(item.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-adminInk truncate max-w-[140px]">
                {item.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <MutedCell value={row.original.categoryName} />,
        size: 150,
      },
      {
        accessorKey: "costPrice",
        header: () => (
          <SortableColumnHeader
            label={cols.costPrice}
            column="costPrice"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <PriceCell value={row.original.costPrice} />,
        size: 110,
      },
      {
        accessorKey: "sellingPrice",
        header: () => (
          <SortableColumnHeader
            label={cols.sellingPrice}
            column="sellingPrice"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 110,
      },
      {
        accessorKey: "durationMins",
        header: cols.durationMins,
        cell: ({ row }) => (
          <span className="text-adminGray-600">
            {row.original.durationMins ? `${row.original.durationMins} phút` : "—"}
          </span>
        ),
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
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => <DateTimeCell value={row.original.createdAt} />,
        size: 140,
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
                      Xóa dịch vụ
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
