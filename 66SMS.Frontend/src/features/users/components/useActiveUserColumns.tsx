import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { IndexCell } from "@/shared/tables/TableCells";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { USER_PERM } from "../constants/user.permissions";
import type { UserDto } from "../types/user.types";

export const USER_COLUMN_LABELS = {
  username: "Tài khoản",
  email: "Email",
  status: "Trạng thái",
  roles: "Vai trò",
} as const;

export const USER_STATUS_MAP: StatusMap = {
  "0": { label: "Vô hiệu hóa", variant: "error" },
  "1": { label: "Hoạt động", variant: "success", dot: true },
};

interface UseActiveUserColumnsParams {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  isDescending: boolean;
  onSort: (column: string) => void;
  headerChecked: boolean | "indeterminate";
  selectedRowIds: Set<number>;
  onToggleAll: (checked: boolean | "indeterminate") => void;
  onToggleOne: (id: number, checked: boolean) => void;
  onEdit: (item: UserDto) => void;
  onDelete: (item: UserDto) => void;
}

export function useActiveUserColumns({
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
}: UseActiveUserColumnsParams) {
  const cols = USER_COLUMN_LABELS;
  const perm = USER_PERM;

  return useMemo<ColumnDef<UserDto>[]>(
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
          const user = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={user.id != null && selectedRowIds.has(user.id)}
                onChange={(checked: boolean) => {
                  if (user.id == null) return;
                  onToggleOne(user.id, checked);
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
        cell: ({ row }) => (
          <span className="font-semibold text-kit-heading">
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
          <span className="text-kit-body">{row.original.email}</span>
        ),
        size: 220,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            statusMap={USER_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "roles",
        header: cols.roles,
        cell: ({ row }) => {
          const roles = row.original.roles;
          if (!roles || roles.length === 0) {
            return <span className="text-kit-body">—</span>;
          }
          return (
            <span className="text-kit-body">{roles.join(", ")}</span>
          );
        },
        size: 150,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const user = row.original;
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
                    onClick={() => onEdit(user)}
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
                    onClick={() => onDelete(user)}
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

export type UserTableRow = Row<UserDto>;
