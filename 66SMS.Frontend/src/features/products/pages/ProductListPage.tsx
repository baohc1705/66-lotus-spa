import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product_categories/types/productCategory.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { Select } from "@/shared/forms/Select";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { useRowSelection } from "@/shared/hooks/useRowSelection";

import { ProductCategorySidebar } from "../components/ProductCategorySidebar";
import { ProductDetailExpanded } from "../components/ProductDetailExpanded";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { ProductStatCards } from "../components/ProductStatCards";
import {
  PRODUCT_COLUMN_LABELS,
  useActiveProductColumns,
} from "../components/useActiveProductColumns";
import { useDeletedProductColumns } from "../components/useDeletedProductColumns";
import { PRODUCT_PERM } from "../constants/product.permissions";
import { useProductListState } from "../hooks/useProductListState";
import {
  useAdminProducts,
  useDeletedProducts,
  useDeleteProduct,
  useDeleteProductMultiples,
  useRestoreProduct,
  useUpdateProduct,
} from "../hooks/useProducts";
import type { ProductDto } from "../types/product.types";

const ENTITY = "sản phẩm";
const ENTITY_SUBJECT = "Sản phẩm";

export function ProductListPage() {
  "use no memo";

  const perm = PRODUCT_PERM;

  const listState = useProductListState();
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
    selectedCategoryId,
    setSelectedCategoryId,
  } = listState;

  const activeQuery = useAdminProducts(queryParams, !showDeleted);
  const deletedQuery = useDeletedProducts(queryParams, showDeleted);

  const productResult = showDeleted ? deletedQuery.data : activeQuery.data;
  const isLoading = showDeleted
    ? deletedQuery.isLoading
    : activeQuery.isLoading;
  const isFetching = showDeleted
    ? deletedQuery.isFetching
    : activeQuery.isFetching;

  const paged = productResult?.data;
  const products = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  let activeProductCount = 0;
  let totalStock = 0;
  for (const p of products) {
    if (p.status === StatusActive.Active) activeProductCount += 1;
    totalStock += p.stockQuantity ?? 0;
  }

  const pageIds = products
    .map((p: ProductDto) => p.id)
    .filter((id): id is number => id != null);

  const {
    selectedRowIds,
    clearSelection,
    headerChecked,
    toggleAll,
    toggleOne,
    selectedCount,
  } = useRowSelection(pageIds);

  const deleteMutation = useDeleteProduct();
  const deleteMultiplesMutation = useDeleteProductMultiples();
  const updateMutation = useUpdateProduct();
  const restoreMutation = useRestoreProduct();

  const { data: categoriesResult } = useProductCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  const handleCategoryFilterChange = useCallback(
    (value: string) => {
      setSelectedCategoryId(value ? Number(value) : null);
      setPageIndex(1);
    },
    [setSelectedCategoryId, setPageIndex],
  );

  const activeColumns = useActiveProductColumns({
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

  const deletedColumns = useDeletedProductColumns({
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(!showDeleted && {
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: () => true,
    }),
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

  const columnLabels = useMemo(() => ({ ...PRODUCT_COLUMN_LABELS }), []);

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <ProductStatCards
        totalProducts={totalCount}
        activeProducts={activeProductCount}
        totalStock={totalStock}
        isLoading={isLoading}
      />

      <div className="flex flex-col items-start gap-3 md:flex-row">
        {!isSidebarMode && (
          <ProductCategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            showDeleted={showDeleted}
          />
        )}

        <div className="w-full min-w-0 flex-1">
          <TablePageShell isFetching={isFetching} isLoading={isLoading}>
            <div className="border-b border-kit px-3 pt-3">
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
                searchPlaceholder="Tìm theo tên, mã sản phẩm..."
              >
                <Select
                  inputSize="sm"
                  className="mb-0! h-9 w-44"
                  value={selectedCategoryId?.toString() ?? ""}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat: ProductCategoryDto) => (
                    <option key={cat.id} value={cat.id?.toString() || ""}>
                      {cat.name}
                    </option>
                  ))}
                </Select>

                {!showDeleted && (
                  <DataTableViewOptions
                    table={table}
                    columnLabels={columnLabels}
                  />
                )}

                <PermissionGate
                  resource={perm.resource}
                  action={perm.create}
                  role={perm.role}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-0"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm sản phẩm
                  </Button>
                </PermissionGate>

                <PermissionGate
                  resource={perm.resource}
                  action={perm.read}
                  role={perm.role}
                >
                  <Button
                    variant="secondary"
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
                pageSize > DEFAULT_LOADING_ROWS
                  ? DEFAULT_LOADING_ROWS
                  : pageSize
              }
              renderExpandedRow={
                showDeleted
                  ? undefined
                  : ({ row }: { row: Row<ProductDto> }) =>
                      row.original.id ? (
                        <ProductDetailExpanded
                          productId={row.original.id}
                          onEdit={(product) => setEditTarget(product)}
                        />
                      ) : null
              }
              emptyState={
                showDeleted ? (
                  <TableEmptyState
                    icon={Trash2}
                    title="Không có sản phẩm đã xóa"
                    hint="Các sản phẩm bị xóa sẽ hiển thị tại đây."
                  />
                ) : (
                  <TableEmptyState
                    icon={Package}
                    title="Chưa có sản phẩm"
                    hint="Thêm sản phẩm mới để bắt đầu quản lý kho."
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
                          Thêm sản phẩm
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
        </div>
      </div>

      <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ProductFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        product={editTarget}
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
          deleteTarget?.name ?? "",
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
