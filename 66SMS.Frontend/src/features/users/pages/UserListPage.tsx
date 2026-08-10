import { useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, Trash2, Users } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import { UserFormDialog } from "../components/UserFormDialog";
import {
  useActiveUserColumns,
  USER_COLUMN_LABELS,
} from "../components/useActiveUserColumns";
import { USER_PERM } from "../constants/user.permissions";
import {
  useGetUsers,
  useDeleteUser,
  useDeleteUserMultiples,
} from "../hooks/useUsers";
import { useUserListState } from "../hooks/useUserListState";
import type { UserDto } from "../types/user.types";

const ENTITY = "người dùng";

export function UserListPage() {
  const perm = USER_PERM;

  const listState = useUserListState();
  const {
    queryParams,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    pageIndex,
    setPageIndex,
    pageSize,
    columnVisibility,
    setColumnVisibility,
    orderBy,
    isDescending,
    handleSort,
    handlePageSizeChange,
    handleSearchChange,
    filter,
  } = listState;

  const { data: usersResult, isLoading, isFetching } = useGetUsers(queryParams);

  const paged = usersResult?.data;
  const users = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);

  const pageIds = useMemo(() => {
    const ids: number[] = [];
    for (let index = 0; index < users.length; index++) {
      const user: UserDto = users[index];
      if (user.id == null) continue;
      ids.push(user.id);
    }
    return ids;
  }, [users]);

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const deleteMutation = useDeleteUser();
  const deleteMultiplesMutation = useDeleteUserMultiples();

  const columns = useActiveUserColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    headerChecked,
    selectedRowIds,
    onToggleAll: toggleAll,
    onToggleOne: toggleOne,
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    manualPagination: true,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleDelete = useCallback(() => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation, setDeleteTarget]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) return;
    deleteMultiplesMutation.mutate(ids, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          setBulkDeleteOpen(false);
          clearSelection();
        }
      },
    });
  }, [
    selectedRowIds,
    deleteMultiplesMutation,
    setBulkDeleteOpen,
    clearSelection,
  ]);

  const columnLabels = useMemo(() => ({ ...USER_COLUMN_LABELS }), []);

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          {selectedCount > 0 ? (
            <TableSelectionBar
              count={selectedCount}
              onClear={clearSelection}
              actions={
                <PermissionGate
                  resource={perm.resource}
                  action={perm.delete}
                  role={perm.role}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="mb-0"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa đã chọn
                  </Button>
                </PermissionGate>
              }
            />
          ) : null}

          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tài khoản, email..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />

            <PermissionGate
              resource={perm.resource}
              action={perm.create}
              role={perm.role}
            >
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </PermissionGate>
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={
            pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
          }
          emptyState={
            <TableEmptyState
              icon={Users}
              title="Chưa có người dùng"
              action={
                <PermissionGate
                  resource={perm.resource}
                  action={perm.create}
                  role={perm.role}
                >
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm người dùng
                  </Button>
                </PermissionGate>
              }
            />
          }
          pagination={
            totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value))
                  }
                  className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                >
                  {[5, 10, 20].map((size: number) => (
                    <option key={size} value={size}>
                      {size} / trang
                    </option>
                  ))}
                </select>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <UserFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        user={editTarget}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={`Xóa ${ENTITY} đã chọn`}
        description={`Bạn có chắc muốn xóa ${selectedCount} ${ENTITY} đã chọn?`}
        confirmLabel="Xóa"
        loading={deleteMultiplesMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Xóa ${ENTITY}`}
        description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.username ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
export default UserListPage;
