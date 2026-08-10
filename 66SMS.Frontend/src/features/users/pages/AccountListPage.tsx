import { useCallback, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Trash2, UserRound } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { Button } from "@/shared/elements/Button";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import {
  ACCOUNT_COLUMN_LABELS,
  useActiveAccountColumns,
} from "../components/useActiveAccountColumns";
import {
  useDeleteUser,
  useDeleteUserMultiples,
  useGetAllAccounts,
  useUpdateUser,
} from "../hooks/useUsers";
import { useAccountListState } from "../hooks/useAccountListState";
import type { UserAccountDto } from "../types/user.types";

export function AccountListPage() {
  const listState = useAccountListState();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const deleteMultiplesMutation = useDeleteUserMultiples();
  const [deleteTarget, setDeleteTarget] = useState<UserAccountDto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const {
    queryParams,
    pageIndex,
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

  const {
    data: accountsResult,
    isLoading,
    isFetching,
  } = useGetAllAccounts(queryParams);

  const paged = accountsResult?.data;
  const accounts = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const pageIds = useMemo(() => {
    const ids: number[] = [];
    for (let index = 0; index < accounts.length; index++) {
      const account: UserAccountDto = accounts[index];
      if (account.id == null) continue;
      ids.push(account.id);
    }
    return ids;
  }, [accounts]);

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const columns = useActiveAccountColumns({
    pageIndex,
    pageSize,
    orderBy,
    isDescending,
    onSort: handleSort,
    headerChecked,
    selectedRowIds,
    onToggleAll: toggleAll,
    onToggleOne: toggleOne,
    onDelete: setDeleteTarget,
    updateMutation,
  });

  const table = useReactTable({
    data: accounts,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const columnLabels = useMemo(() => ({ ...ACCOUNT_COLUMN_LABELS }), []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation]);

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
  }, [selectedRowIds, deleteMultiplesMutation, clearSelection]);

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          {selectedCount > 0 ? (
            <TableSelectionBar
              count={selectedCount}
              onClear={clearSelection}
              actions={
                <Button
                  variant="danger"
                  size="sm"
                  className="mb-0"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa đã chọn
                </Button>
              }
            />
          ) : null}

          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tài khoản, email..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState icon={UserRound} title="Chưa có tài khoản" />
          }
          pagination={
            totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {rangeStart}-{rangeEnd} / {totalCount}
                  </span>
                  <Select
                    value={String(pageSize)}
                    onChange={(event) =>
                      handlePageSizeChange(Number(event.target.value))
                    }
                    options={[
                      { value: "5", label: "5 / trang" },
                      { value: "10", label: "10 / trang" },
                      { value: "20", label: "20 / trang" },
                    ]}
                    inputSize="sm"
                    className="w-auto min-w-28"
                  />
                </div>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={listState.setPageIndex}
                  size="sm"
                />
              </div>
            ) : null
          }
        />
      </TablePageShell>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Xóa tài khoản đã chọn"
        description={
          "Bạn có chắc muốn xóa " +
          selectedCount +
          " tài khoản đã chọn?"
        }
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
        title="Xóa tài khoản"
        description={
          'Bạn có chắc muốn xóa tài khoản "' +
          (deleteTarget?.username ?? "") +
          '"? Hành động này không thể hoàn tác.'
        }
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

export default AccountListPage;
