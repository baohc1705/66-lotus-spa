import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
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
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { IndexCell } from "@/shared/components/DataTable/tableCells";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CUSTOMER_PERM } from "../constants/customer.permissions";
import type { CustomerDto } from "../types/customer.types";

export const CUSTOMER_COLUMN_LABELS = {
  fullName: "Khách hàng",
  phone: "SĐT",
  email: "Email",
  gender: "Giới tính",
  loyaltyPoint: "Điểm",
  source: "Nguồn",
  status: "Trạng thái",
} as const;

export const CUSTOMER_STATUS_MAP: StatusMap = {
  "0": { label: "Ngưng HĐ", variant: "error" },
  "1": { label: "Hoạt động", variant: "success", dot: true },
  "2": { label: "Tạm khóa", variant: "warning" },
};

const GENDER_MAP: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
};

interface UseActiveCustomerColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: CustomerDto) => void;
  onDelete: (item: CustomerDto) => void;
}

export function useActiveCustomerColumns({
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
}: UseActiveCustomerColumnsParams) {
  const cols = CUSTOMER_COLUMN_LABELS;
  const perm = CUSTOMER_PERM;

  return useMemo<ColumnDef<CustomerDto>[]>(
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
              aria-label={`Chọn ${item.fullName ?? "khách hàng"}`}
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
        accessorKey: "fullName",
        header: () => (
          <SortableColumnHeader
            label={cols.fullName}
            column="fullname"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => {
          const cust = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                {cust.avatarUrl ? (
                  <img
                    src={cust.avatarUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-amber-600">
                    {(cust.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[140px]">
                {cust.fullName ?? "—"}
              </span>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "phone",
        header: cols.phone,
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">{row.original.phone ?? "—"}</span>
        ),
        size: 110,
      },
      {
        accessorKey: "email",
        header: () => (
          <SortableColumnHeader
            label={cols.email}
            column="email"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">{row.original.email ?? "—"}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "gender",
        header: cols.gender,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {GENDER_MAP[row.original.gender ?? ""] ?? "—"}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "loyaltyPoint",
        header: cols.loyaltyPoint,
        cell: ({ row }) => {
          const points = row.original.loyaltyPoint;
          return (
            <span className="font-semibold text-lotus-deep">{points ?? 0}</span>
          );
        },
        size: 80,
      },
      {
        accessorKey: "source",
        header: cols.source,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">{row.original.source ?? "—"}</span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status?.toString() ?? null}
            statusMap={CUSTOMER_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const cust = row.original;
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
                    <DropdownMenuItem onClick={() => onEdit(cust)}>
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
                      onClick={() => onDelete(cust)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa khách hàng
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
      cols,
      perm,
    ],
  );
}

export type CustomerTableRow = Row<CustomerDto>;
