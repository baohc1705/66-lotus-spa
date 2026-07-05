import { useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, Trash2, Users } from "lucide-react";

import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { Button } from "@/shared/components/ui/button";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { TABLE_STYLES } from "@/shared/styles/table.styles";
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

  const pageIds = useMemo(
    () =>
      users
        .map((u: UserDto) => u.id)
        .filter((id): id is number => id != null),
    [users]
  );

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
  }, [selectedRowIds, deleteMultiplesMutation, setBulkDeleteOpen, clearSelection]);

  const columnLabels = useMemo(() => ({ ...USER_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-lotus-deep">Quản lý người dùng</h1>
        </div>
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tài khoản, email..."
        >
          {selectedCount > 0 && (
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
                    variant="destructive"
                    size="sm"
                    className="text-[12px] h-7 px-2"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                    Xóa đã chọn
                  </Button>
                </PermissionGate>
              }
            />
          )}

          <DataTableViewOptions table={table} columnLabels={columnLabels} />

          <PermissionGate
            resource={perm.resource}
            action={perm.create}
            role={perm.role}
          >
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className={TABLE_STYLES.toolbarBtn}
            >
              <Plus className="w-3.5 h-3.5" />
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
            hint="Thêm tài khoản người dùng mới để quản lý phân quyền."
            action={
              <PermissionGate
                resource={perm.resource}
                action={perm.create}
                role={perm.role}
              >
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-[12px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm người dùng
                </Button>
              </PermissionGate>
            }
          />
        }
        pagination={
          paged && totalCount > 0 ? (
            <DataTablePagination
              pageIndex={paged.pageIndex}
              pageSize={paged.pageSize}
              totalCount={paged.totalCount}
              totalPages={paged.totalPages}
              hasPreviousPage={paged.hasPreviousPage}
              hasNextPage={paged.hasNextPage}
              onPageChange={setPageIndex}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null
        }
      />

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
        title={CONFIRM_MSG.bulkDeleteTitle(ENTITY)}
        description={CONFIRM_MSG.bulkDeleteDescription(selectedCount, ENTITY)}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMultiplesMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(
          ENTITY,
          deleteTarget?.username ?? ""
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TablePageShell>
  );
}
export default UserListPage;
