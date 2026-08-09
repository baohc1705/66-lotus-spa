import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/shared/elements/Badge";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  MutedSmallCell,
  NameCell,
  TextCell,
} from "@/shared/tables/TableCells";

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

function statusBadge(status: string | number | null | undefined) {
  if (Number(status) === 1) {
    return (
      <Badge variant="success" soft>
        Hoạt động
      </Badge>
    );
  }
  return (
    <Badge variant="danger" soft>
      Vô hiệu hóa
    </Badge>
  );
}

function emailConfirmedBadge(confirmed: boolean | null | undefined) {
  if (confirmed) {
    return (
      <Badge variant="success" soft>
        Đã xác nhận
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Chưa xác nhận
    </Badge>
  );
}

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
        cell: ({ row }) => <NameCell value={row.original.username} />,
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
        cell: ({ row }) => <TextCell value={row.original.email} />,
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
        cell: ({ row }) => emailConfirmedBadge(row.original.isEmailConfirmed),
        size: 140,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => statusBadge(row.original.status),
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
