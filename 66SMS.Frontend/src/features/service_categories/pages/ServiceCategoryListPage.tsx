import { useCallback, useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus, Trash2, ArrowLeft, Box } from "lucide-react";

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
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import { ServiceCategoryFormDialog } from "../components/ServiceCategoryFormDialog";
import {
  useActiveServiceCategoryColumns,
  SERVICE_CATEGORY_COLUMN_LABELS,
} from "../components/useActiveServiceCategoryColumns";
import { useDeletedServiceCategoryColumns } from "../components/useDeletedServiceCategoryColumns";
import { SERVICE_CATEGORY_PERM } from "../constants/serviceCategory.permissions";
import {
  useAdminServiceCategories,
  useDeletedServiceCategories,
  useDeleteServiceCategory,
  useDeleteServiceCategoryMultiples,
  useUpdateServiceCategory,
  useRestoreServiceCategory,
} from "../hooks/useServiceCategories";
import { useServiceCategoryListState } from "../hooks/useServiceCategoryListState";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";

const ENTITY = "nhóm dịch vụ";
const ENTITY_SUBJECT = "Nhóm dịch vụ";
const DELETE_WARNING = "Các dịch vụ thuộc nhóm này có thể bị ảnh hưởng.";
const BULK_DELETE_WARNING =
  "Các dịch vụ thuộc các nhóm này có thể bị ảnh hưởng.";

export function ServiceCategoryListPage() {
  "use no memo";
  const perm = SERVICE_CATEGORY_PERM;

  const listState = useServiceCategoryListState();
  const {
    queryParams,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    handleToggleView,
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

  const activeQuery = useAdminServiceCategories(queryParams, !showDeleted);
  const deletedQuery = useDeletedServiceCategories(queryParams, showDeleted);

  const categoryResult = showDeleted ? deletedQuery.data : activeQuery.data;
  const isLoading = showDeleted
    ? deletedQuery.isLoading
    : activeQuery.isLoading;
  const isFetching = showDeleted
    ? deletedQuery.isFetching
    : activeQuery.isFetching;

  const paged = categoryResult?.data;
  const categories = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const pageIds = useMemo(
    () =>
      categories
        .map((c: ServiceCategoryDto) => c.id)
        .filter((id): id is number => id !== undefined),
    [categories],
  );

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const deleteMutation = useDeleteServiceCategory();
  const deleteMultiplesMutation = useDeleteServiceCategoryMultiples();
  const updateMutation = useUpdateServiceCategory();
  const restoreMutation = useRestoreServiceCategory();

  const activeColumns = useActiveServiceCategoryColumns({
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
    updateMutation,
  });

  const deletedColumns = useDeletedServiceCategoryColumns({
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
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

  const handleRestore = useCallback(() => {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setRestoreTarget(null);
      },
    });
  }, [restoreTarget, restoreMutation, setRestoreTarget]);

  const columnLabels = useMemo(
    () => ({ ...SERVICE_CATEGORY_COLUMN_LABELS }),
    [],
  );

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isFetching={isFetching} isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          {selectedCount > 0 && !showDeleted ? (
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
            searchPlaceholder="Tìm kiếm nhóm dịch vụ..."
          >
            {!showDeleted && (
              <DataTableViewOptions table={table} columnLabels={columnLabels} />
            )}

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
                <Plus className="h-3.5 w-3.5" />
                Thêm nhóm dịch vụ
              </Button>
            </PermissionGate>

            <PermissionGate
              resource={perm.resource}
              action={perm.read}
              role={perm.role}
            >
              <Button
                variant="admin"
                size="sm"
                className="mb-0"
                onClick={() => handleToggleView(clearSelection)}
              >
                {showDeleted ? (
                  <>
                    <ArrowLeft className="h-4 w-4" />
                    {COMMON_MSG.back}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {COMMON_MSG.restore}
                  </>
                )}
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
            showDeleted ? (
              <TableEmptyState
                icon={Trash2}
                title="Không có nhóm dịch vụ đã xóa"
                hint="Các nhóm dịch vụ bị xóa sẽ hiển thị tại đây."
              />
            ) : (
              <TableEmptyState
                icon={Box}
                title="Chưa có nhóm dịch vụ"
                hint="Thêm nhóm dịch vụ mới để phân loại."
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
                      <Plus className="h-3.5 w-3.5" />
                      Thêm nhóm dịch vụ
                    </Button>
                  </PermissionGate>
                }
              />
            )
          }
          pagination={
            paged && totalCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {rangeStart}-{rangeEnd} / {totalCount}
                  </span>
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
                </div>
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

      <ServiceCategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <ServiceCategoryFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        serviceCategory={editTarget}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={CONFIRM_MSG.bulkDeleteTitle(ENTITY)}
        description={CONFIRM_MSG.bulkDeleteDescription(
          selectedCount,
          ENTITY,
          BULK_DELETE_WARNING,
        )}
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
          deleteTarget?.name ?? "",
          DELETE_WARNING,
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={CONFIRM_MSG.restoreTitle(ENTITY_SUBJECT)}
        description={CONFIRM_MSG.restoreDescription(
          ENTITY_SUBJECT,
          restoreTarget?.name ?? "",
        )}
        confirmLabel={COMMON_MSG.restore}
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
