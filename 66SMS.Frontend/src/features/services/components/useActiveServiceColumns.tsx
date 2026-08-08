import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { Pencil, Trash2, Eye } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Switch } from "@/shared/forms/Switch";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  NameCell,
} from "@/shared/tables/TableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import { formatCurrency } from "@/shared/utils/currency";
import type { Result } from "@/shared/types/common.types";

import { SERVICE_PERM } from "../constants/service.permissions";
import type { ServiceListDto } from "../types/service.types";
import type { UpdateServicePayload } from "../schemas/service.schema";

export const SERVICE_COLUMN_LABELS = {
  code: "Mã DV",
  imageUrl: "Ảnh",
  name: "Tên dịch vụ",
  categoryName: "Nhóm dịch vụ",
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
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" soft>
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        id: "imageUrl",
        accessorKey: "imageUrl",
        header: cols.imageUrl,
        cell: ({ row }) => (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
            <FallbackImage
              kind="service"
              src={row.original.imageUrl}
              alt=""
              className="h-10 w-10 object-cover"
            />
          </div>
        ),
        size: 72,
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
        size: 180,
      },
      {
        accessorKey: "categoryName",
        header: cols.categoryName,
        cell: ({ row }) => <MutedCell value={row.original.categoryName} />,
        size: 150,
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
            onPrimary
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-bold text-kit-primary">
            {formatCurrency(row.original.sellingPrice)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "durationMins",
        header: cols.durationMins,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {row.original.durationMins
              ? `${row.original.durationMins} phút`
              : "—"}
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
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => <DateTimeCell value={row.original.createdAt} />,
        size: 140,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
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
        size: 130,
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
