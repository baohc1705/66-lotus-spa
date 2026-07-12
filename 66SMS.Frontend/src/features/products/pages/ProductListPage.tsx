import { containerVariants } from "@/shared/motion/pageVariants";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { TableSelectionBar } from "@/shared/components/DataTable/TableSelectionBar";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/components/ui/button";
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
  const products = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  // Stat card calculations
  const activeProductCount = useMemo(
    () =>
      products.filter((p: ProductDto) => p.status === StatusActive.Active)
        .length,
    [products],
  );
  const totalStock = useMemo(
    () =>
      products.reduce(
        (sum: number, p: ProductDto) => sum + (p.stockQuantity ?? 0),
        0,
      ),
    [products],
  );

  const pageIds = useMemo(
    () =>
      products
        .map((p: ProductDto) => p.id)
        .filter((id): id is number => id != null),
    [products],
  );

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
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

  // eslint-disable-next-line react-hooks/incompatible-library
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
    <div className="flex h-full overflow-hidden gap-2">
      {/* Sidebar danh mục */}
      {!isSidebarMode && (
        <ProductCategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          showDeleted={showDeleted}
        />
      )}

      {/* Right: Stats + Table */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        {/* Stats row */}
        <div className="shrink-0">
          <ProductStatCards
            totalProducts={totalCount}
            activeProducts={activeProductCount}
            totalStock={totalStock}
            isLoading={isLoading}
          />
        </div>

        {/* Table card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lotus-admin-table-page-card flex-1 min-h-0 flex flex-col overflow-hidden relative"
        >
          {/* Fetching bar */}
          {isFetching && !isLoading && (
            <div className="lotus-admin-table-fetch-bar">
              <div className="lotus-admin-table-fetch-bar-inner" />
            </div>
          )}

          {/* Toolbar */}
          <div className="px-4 pt-3 shrink-0">
            <DataTableToolbar
              searchValue={filter}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Tìm theo tên, mã sản phẩm..."
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
                  variant="admin"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="lotus-admin-table-toolbar-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm sản phẩm
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
                  title={showDeleted ? "Quay lại danh sách" : "Sản phẩm đã xóa"}
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

          {/* Table */}
          <DataTable
            table={table}
            isLoading={isLoading}
            loadingRows={
              pageSize > DEFAULT_LOADING_ROWS ? DEFAULT_LOADING_ROWS : pageSize
            }
            onRowClick={showDeleted ? undefined : (row) => row.toggleExpanded()}
            renderSubComponent={
              showDeleted
                ? undefined
                : ({ row }) =>
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
                        onClick={() => setCreateOpen(true)}
                        className="mt-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm sản phẩm
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
        </motion.div>
      </div>

      {/* Dialogs */}
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
