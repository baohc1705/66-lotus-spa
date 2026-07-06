import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowLeft, Box, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { TablePageShell } from "@/shared/components/DataTable/TablePageShell";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";

import { useRowSelection } from "@/shared/hooks/useRowSelection";
import { ProductCategoryFormDialog } from "../components/ProductCategoryFormDialog";
import {
  CATEGORY_COLUMN_LABELS,
  useActiveCategoryColumns,
} from "../components/useActiveCategoryColumns";
import { useDeletedCategoryColumns } from "../components/useDeletedCategoryColumns";
import { PRODUCT_CATEGORY_PERM } from "../constants/productCategory.permissions";
import {
  useDeletedProductCategories,
  useDeleteProductCategory,
  useDeleteProductCategoryMultiples,
  useProductCategories,
  useRestoreProductCategory,
  useUpdateProductCategory,
} from "../hooks/useProductCategories";
import { useProductCategoryListState } from "../hooks/useProductCategoryListState";
import type { ProductCategoryDto } from "../types/productCategory.types";

const ENTITY = "danh mục";
const ENTITY_SUBJECT = "Danh mục";
const DELETE_WARNING =
  "Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.";
const BULK_DELETE_WARNING =
  "Các sản phẩm thuộc các danh mục này có thể bị ảnh hưởng.";

export function ProductCategoryListPage() {
  const perm = PRODUCT_CATEGORY_PERM;

  const listState = useProductCategoryListState();
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

  const activeQuery = useProductCategories(queryParams, !showDeleted);
  const deletedQuery = useDeletedProductCategories(queryParams, showDeleted);

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

  const pageIds = useMemo(
    () =>
      categories
        .map((c: ProductCategoryDto) => c.id)
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

  const deleteMutation = useDeleteProductCategory();
  const deleteMultiplesMutation = useDeleteProductCategoryMultiples();
  const updateMutation = useUpdateProductCategory();
  const restoreMutation = useRestoreProductCategory();

  const activeColumns = useActiveCategoryColumns({
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

  const deletedColumns = useDeletedCategoryColumns({
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

  const columnLabels = useMemo(() => ({ ...CATEGORY_COLUMN_LABELS }), []);

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
        <DataTableToolbar
          searchValue={filter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm kiếm danh mục..."
        >
          {selectedCount > 0 && !showDeleted && (
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
                    className="lotus-admin-btn-toolbar"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa đã chọn
                  </Button>
                </PermissionGate>
              }
            />
          )}

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
              onClick={() => setCreateOpen(true)}
              className="lotus-admin-table-toolbar-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm danh mục
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
              className="lotus-admin-table-toolbar-btn"
              onClick={() => handleToggleView(clearSelection)}
              title={
                showDeleted ? "Quay lại danh sách" : "Danh mục đã xóa"
              }
            >
              {showDeleted ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  {COMMON_MSG.back}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
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
              title="Không có danh mục đã xóa"
              hint="Các danh mục bị xóa sẽ hiển thị tại đây."
            />
          ) : (
            <TableEmptyState
              icon={Box}
              title="Chưa có danh mục sản phẩm"
              hint="Thêm danh mục mới để phân loại sản phẩm."
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
                    className="mt-1 text-lotus-admin-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm danh mục
                  </Button>
                </PermissionGate>
              }
            />
          )
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

      <ProductCategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <ProductCategoryFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        productCategory={editTarget}
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
    </TablePageShell>
  );
}
