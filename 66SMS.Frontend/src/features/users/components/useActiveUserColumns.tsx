import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { SortableColumnHeader } from "@/shared/components/DataTable/SortableColumnHeader";
import { IndexCell } from "@/shared/components/DataTable/tableCells";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { COMMON_MSG } from "@/shared/constants/common.messages";
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
          <Checkbox
            checked={headerChecked}
            onCheckedChange={onToggleAll}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Checkbox
              checked={user.id != null && selectedRowIds.has(user.id)}
              onCheckedChange={(checked) => {
                if (user.id == null) return;
                onToggleOne(user.id, checked === true);
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
        cell: ({ row }) => (
          <span className="text-lotus-deep/80">
            {row.original.roles?.join(", ") || "—"}
          </span>
        ),
        size: 150,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const user = row.original;
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
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
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
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa người dùng
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

export type UserTableRow = Row<UserDto>;
