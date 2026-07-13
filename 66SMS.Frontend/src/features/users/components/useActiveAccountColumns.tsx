import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";

import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  MutedSmallCell,
} from "@/shared/components/DataTable/tableCells";
import { StatusBadge } from "@/shared/components/StatusBadge";

import { USER_STATUS_MAP } from "./useActiveUserColumns";
import type { UserAccountDto } from "../types/user.types";

export const ACCOUNT_COLUMN_LABELS = {
  username: "Tài khoản",
  email: "Email",
  role: "Vai trò",
  isEmailConfirmed: "Xác nhận email",
  accessFailedCount: "Sai mật khẩu",
  status: "Trạng thái",
  lastLoginAt: "Đăng nhập cuối",
  createdAt: "Ngày tạo",
} as const;

interface UseActiveAccountColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
}

export function useActiveAccountColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
}: UseActiveAccountColumnsParams) {
  const cols = ACCOUNT_COLUMN_LABELS;

  return useMemo<ColumnDef<UserAccountDto>[]>(
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
        accessorKey: "username",
        header: () => (
          <SortableColumnHeader
            label={cols.username}
            column="username"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.username}
          </span>
        ),
        size: 150,
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
          <span className="text-lotus-deep/80">{row.original.email}</span>
        ),
        size: 220,
      },
      {
        accessorKey: "role",
        header: cols.role,
        cell: ({ row }) => <MutedCell value={row.original.role} />,
        size: 130,
      },
      {
        accessorKey: "isEmailConfirmed",
        header: cols.isEmailConfirmed,
        cell: ({ row }) =>
          row.original.isEmailConfirmed ? (
            <span className="inline-flex items-center gap-1 text-xs text-adminGreen-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã xác nhận
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-lotus-deep/50">
              <XCircle className="w-3.5 h-3.5" />
              Chưa xác nhận
            </span>
          ),
        size: 140,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status)}
            statusMap={USER_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "accessFailedCount",
        header: cols.accessFailedCount,
        cell: ({ row }) => (
          <MutedSmallCell value={row.original.accessFailedCount} />
        ),
        size: 110,
      },
      {
        accessorKey: "lastLoginAt",
        header: cols.lastLoginAt,
        cell: ({ row }) => <DateTimeCell value={row.original.lastLoginAt} />,
        size: 160,
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <SortableColumnHeader
            label={cols.createdAt}
            column="createdAt"
            orderBy={orderBy}
            isDescending={isDescending}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => <DateTimeCell value={row.original.createdAt} />,
        size: 160,
      },
    ],
    [pageIndex, pageSize, orderBy, isDescending, onSort, cols],
  );
}
