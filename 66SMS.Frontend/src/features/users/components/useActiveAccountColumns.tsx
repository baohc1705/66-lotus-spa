import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseMutationResult } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Switch } from "@/shared/forms/Switch";
import { Tooltip } from "@/shared/components/Tooltip";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  DateTimeCell,
  IndexCell,
  MutedCell,
  MutedSmallCell,
  NameCell,
  TextCell,
} from "@/shared/tables/TableCells";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";

import type { UpdateUserPayload, UserAccountDto } from "../types/user.types";

export const ACCOUNT_COLUMN_LABELS = {
  username: "Tài khoản",
  email: "Email",
  role: "Vai trò",
  isEmailConfirmed: "Xác nhận email",
  accessFailedCount: "Sai mật khẩu",
  status: "Trạng thái",
  lastLoginAt: "Đăng nhập cuối",
  createdAt: "Ngày tạo",
  actions: "Thao tác",
} as const;

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
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onDelete: (item: UserAccountDto) => void;
  updateMutation: UseMutationResult<
    Result<object>,
    Error,
    UpdateUserPayload
  >;
}

export function useActiveAccountColumns({
  pageIndex,
  pageSize,
  orderBy,
  isDescending,
  onSort,
  headerChecked,
  selectedRowIds,
  onToggleAll,
  onToggleOne,
  onDelete,
  updateMutation,
}: UseActiveAccountColumnsParams) {
  const cols = ACCOUNT_COLUMN_LABELS;

  return useMemo<ColumnDef<UserAccountDto>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div onClick={(event) => event.stopPropagation()}>
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
          const account = row.original;
          return (
            <div onClick={(event) => event.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={account.id != null && selectedRowIds.has(account.id)}
                onChange={(checked: boolean) => {
                  if (account.id == null) return;
                  onToggleOne(account.id, checked);
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
        cell: ({ row }) => {
          const account = row.original;
          const status = Number(account.status);
          const isDeleted = status === StatusActive.Deleted;

          return (
            <div
              onClick={(event) => event.stopPropagation()}
              className="flex items-center"
            >
              <Switch
                checked={status === StatusActive.Active}
                onChange={(checked: boolean) => {
                  if (!account.id) return;
                  updateMutation.mutate({
                    id: account.id,
                    status: checked
                      ? StatusActive.Active
                      : StatusActive.Inactive,
                  });
                }}
                disabled={isDeleted || updateMutation.isPending}
                tone="success"
              />
            </div>
          );
        },
        size: 100,
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
      {
        id: "actions",
        header: cols.actions,
        cell: ({ row }) => {
          const account = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Tooltip text="Xóa">
                <Button
                  size="icon-sm"
                  variant="outline-danger"
                  className="mb-0 mr-0"
                  onClick={() => onDelete(account)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>
          );
        },
        size: 80,
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
      onDelete,
      updateMutation,
      cols,
    ],
  );
}
