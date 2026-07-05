import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
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
import { formatDate } from "@/shared/utils/date.utils";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { STAFF_PERM } from "../constants/staff.permissions";
import type { StaffDto } from "../types/staff.types";

export const STAFF_COLUMN_LABELS = {
  fullName: "Nhân viên",
  code: "Mã NV",
  phone: "SĐT",
  contractType: "Loại HĐ",
  basicSalary: "Lương",
  gender: "Giới tính",
  createdAt: "Ngày tạo",
  status: "Trạng thái",
  email: "Email",
} as const;

export const STAFF_STATUS_MAP: StatusMap = {
  "0": { label: "Tạm nghỉ", variant: "warning" },
  "1": { label: "Đang làm", variant: "success", dot: true },
  "2": { label: "Nghỉ việc", variant: "error" },
};

const GENDER_MAP: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
};

interface UseActiveStaffColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: StaffDto) => void;
  onDelete: (item: StaffDto) => void;
}

export function useActiveStaffColumns({
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
}: UseActiveStaffColumnsParams) {
  const cols = STAFF_COLUMN_LABELS;
  const perm = STAFF_PERM;

  return useMemo<ColumnDef<StaffDto>[]>(
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
          const staff = row.original;
          return (
            <Checkbox
              checked={staff.id != null && selectedRowIds.has(staff.id)}
              onCheckedChange={(checked) => {
                if (staff.id == null) return;
                onToggleOne(staff.id, checked === true);
              }}
              aria-label={`Select row`}
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
          <span className="text-lotus-leaf/80">{row.original.code ?? "—"}</span>
        ),
        size: 100,
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
          const staff = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lotus-leaf/10 flex items-center justify-center shrink-0 overflow-hidden">
                {staff.avatarUrl ? (
                  <img
                    src={staff.avatarUrl}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-lotus-leaf">
                    {(staff.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[140px]">
                {staff.fullName ?? "—"}
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
          <span className="text-lotus-deep/80">
            {row.original.phone ?? "—"}
          </span>
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
          <span className="text-lotus-deep/70">
            {row.original.email ?? "—"}
          </span>
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
        accessorKey: "contractType",
        header: cols.contractType,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.contractType ?? "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "basicSalary",
        header: cols.basicSalary,
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.basicSalary !== null &&
            row.original.basicSalary !== undefined
              ? new Intl.NumberFormat("vi-VN").format(row.original.basicSalary)
              : "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: cols.createdAt,
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.createdAt
              ? formatDate(row.original.createdAt).format("DD/MM/YYYY")
              : "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            statusMap={STAFF_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const staff = row.original;
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
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(staff)}>
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
                      onClick={() => onDelete(staff)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa nhân viên
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

export type StaffTableRow = Row<StaffDto>;
