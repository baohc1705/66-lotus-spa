import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { Pencil, Trash2, Eye } from "lucide-react";

import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Switch } from "@/shared/forms/Switch";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  PriceCell,
} from "@/shared/tables/TableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";

import { TREATMENT_COURSE_PERM } from "../constants/treatmentCourse.permissions";
import type { TreatmentCourseDto } from "../types/treatmentCourse.types";
import type { UpdateTreatmentCoursePayload } from "../schemas/treatmentCourse.schema";

export const TREATMENT_COURSE_COLUMN_LABELS = {
  code: "Mã",
  name: "Tên liệu trình",
  totalSessions: "Số buổi",
  sellingPrice: "Giá bán",
  originalPrice: "Giá gốc",
  status: "Trạng thái",
} as const;

interface UseActiveTreatmentCourseColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: TreatmentCourseDto) => void;
  onDelete: (item: TreatmentCourseDto) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    { id: number; payload: UpdateTreatmentCoursePayload }
  >;
}

export function useActiveTreatmentCourseColumns({
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
}: UseActiveTreatmentCourseColumnsParams) {
  const cols = TREATMENT_COURSE_COLUMN_LABELS;
  const perm = TREATMENT_COURSE_PERM;

  return useMemo<ColumnDef<TreatmentCourseDto>[]>(
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
                checked={
                  item.id !== undefined &&
                  item.id !== null &&
                  selectedRowIds.has(item.id)
                }
                onChange={(checked: boolean) => {
                  if (item.id === undefined || item.id === null) return;
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
        cell: ({ row }) => (
          <div>
            <p className="max-w-[200px] truncate text-sm font-semibold text-kit-heading">
              {row.original.name ?? "—"}
            </p>
            {row.original.categoryName ? (
              <p className="text-xs text-kit-muted">
                {row.original.categoryName}
              </p>
            ) : null}
          </div>
        ),
        size: 240,
      },
      {
        accessorKey: "totalSessions",
        header: cols.totalSessions,
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
            {row.original.totalSessions ?? 0}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: cols.sellingPrice,
        cell: ({ row }) => <PriceCell value={row.original.sellingPrice} />,
        size: 120,
      },
      {
        accessorKey: "originalPrice",
        header: cols.originalPrice,
        cell: ({ row }) => <PriceCell value={row.original.originalPrice} />,
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
                onChange={(checked: boolean) => {
                  if (!item.id) return;
                  updateMutation.mutate({
                    id: item.id,
                    payload: {
                      status: checked
                        ? StatusActive.Active
                        : StatusActive.Inactive,
                    },
                  });
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
