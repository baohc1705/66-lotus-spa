import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useGetUsers } from "@/features/users/hooks/useGetUsers";
import { useDeleteUser } from "@/features/users/hooks/useDeleteUser";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { type UserDto } from "@/features/users/types/user.types";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  onEdit: (user: UserDto) => void;
}

export const UserTable = ({ onEdit }: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useGetUsers({
    pageIndex: pagination.pageIndex + 1, // backend dùng 1-based
    pageSize: pagination.pageSize,
  });

  const deleteUser = useDeleteUser();

  const columns: ColumnDef<UserDto>[] = [
    { accessorKey: "id", header: "ID", size: 60 },
    { accessorKey: "username", header: "Tài khoản" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "ACTIVE" ? "success" : "error"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "roles",
      header: "Vai trò",
      cell: ({ row }) => row.original.roles?.join(", ") ?? "—",
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <PermissionGate resource="users" action="update">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              Sửa
            </Button>
          </PermissionGate>
          <PermissionGate resource="users" action="delete">
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={() => deleteUser.mutate({ id: row.original.id })}
            >
              Xoá
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: data?.totalPages ?? 0,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) return <p className="text-center py-8">Đang tải...</p>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: {data?.totalCount ?? 0} người dùng
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
};
