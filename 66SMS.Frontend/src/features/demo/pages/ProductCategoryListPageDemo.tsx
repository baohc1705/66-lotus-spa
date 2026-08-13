import { useCallback, useMemo } from "react";
import {
  useDeleteProductCategorBulkDemo,
  useDeleteProductCategoryDemo,
  useProductCategoriesDemo,
  useUpdateProductCategoryDemo,
} from "../hooks/useProductCategoriesDemo";
import { useProductCategoryListStateDemo } from "../hooks/useProductCategoryListStateDemo";
import type { ProductCategoryDemo } from "../types/productCategoryDemo.type";
import { useRowSelection } from "@/shared/hooks/useRowSelection";
import {
  CATEGORY_COLUMN_LABELS_DEMO,
  useActiveCategoryColumnsDemo,
} from "../components/useActiveCategoryColumnsDemo";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { PRODUCT_CATEGORY_DEMO_PERM } from "../constants/productCategoryDemo.permissions";
import { Button } from "@/shared/elements/Button";
import { Box, Plus, Trash2 } from "lucide-react";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { DataTable } from "@/shared/tables/DataTable";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { Pagination } from "@/shared/components/Pagination";
import { ProductCategoryFormDialogDemo } from "../components/ProductCategoryFormDialogDemo";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export function ProductCategoryListPageDemo() {
  "use no memo";
  const listState = useProductCategoryListStateDemo();
  const {
    queryParams,
    showDeleted,
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

  const activeQuery = useProductCategoriesDemo(queryParams, !showDeleted);
  const categoryResult = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;

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
        .map((c: ProductCategoryDemo) => c.id)
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

  const deleteMutation = useDeleteProductCategoryDemo();
  const deleteMultiplesMutation = useDeleteProductCategorBulkDemo();
  const updateMutation = useUpdateProductCategoryDemo();

  const activeColumns = useActiveCategoryColumnsDemo({
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

  const table = useReactTable({
    data: categories,
    columns: activeColumns,
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
      onSuccess: (res) => {
        if (res.isSuccess) setDeleteTarget(null);
      },
    });
  }, [deleteMutation, setDeleteTarget, deleteTarget]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) return;
    deleteMultiplesMutation.mutate(
      { ids },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            setBulkDeleteOpen(false);
            clearSelection();
          }
        },
      },
    );
  }, [
    selectedRowIds,
    deleteMultiplesMutation,
    setBulkDeleteOpen,
    clearSelection,
  ]);
  const columnLabels = useMemo(() => ({ ...CATEGORY_COLUMN_LABELS_DEMO }), []);
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
                  resource={PRODUCT_CATEGORY_DEMO_PERM.resource}
                  action={PRODUCT_CATEGORY_DEMO_PERM.delete}
                  role={PRODUCT_CATEGORY_DEMO_PERM.role}
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
            searchPlaceholder="Tìm kiếm danh mục..."
          >
            <DataTableViewOptions table={table} columnLabels={columnLabels} />
            <PermissionGate
              resource={PRODUCT_CATEGORY_DEMO_PERM.resource}
              action={PRODUCT_CATEGORY_DEMO_PERM.create}
              role={PRODUCT_CATEGORY_DEMO_PERM.role}
            >
              <Button
                variant="primary"
                size="sm"
                className="mb-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm danh mục
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
              icon={Box}
              title="Chưa có danh mục nào"
              action={
                <PermissionGate
                  resource={PRODUCT_CATEGORY_DEMO_PERM.resource}
                  action={PRODUCT_CATEGORY_DEMO_PERM.create}
                  role={PRODUCT_CATEGORY_DEMO_PERM.role}
                >
                  <Button
                    variant="admin"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm danh mục
                  </Button>
                </PermissionGate>
              }
            />
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

      <ProductCategoryFormDialogDemo
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <ProductCategoryFormDialogDemo
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
        title={`Xóa danh mục đã chọn`}
        description={`Bạn có chắc muốn xóa ${selectedCount} danh mục đã chọn?`}
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
        title={`Xóa danh mục`}
        description={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
