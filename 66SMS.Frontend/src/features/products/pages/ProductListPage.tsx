import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";

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

import { ProductFormDialog } from "../components/ProductFormDialog";
import { ProductDetailExpanded } from "../components/ProductDetailExpanded";
import {
  useActiveProductColumns,
  PRODUCT_COLUMN_LABELS,
} from "../components/useActiveProductColumns";
import { useDeletedProductColumns } from "../components/useDeletedProductColumns";
import { PRODUCT_PERM } from "../constants/product.permissions";
import {
  useAdminProducts,
  useDeletedProducts,
  useDeleteProduct,
  useDeleteProductMultiples,
  useUpdateProduct,
  useRestoreProduct,
} from "../hooks/useProducts";
import { useProductListState } from "../hooks/useProductListState";
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
  } = listState;

  const activeQuery = useAdminProducts(queryParams, !showDeleted);
  const deletedQuery = useDeletedProducts(queryParams, showDeleted);

  const productResult = showDeleted ? deletedQuery.data : activeQuery.data;
  const isLoading = showDeleted ? deletedQuery.isLoading : activeQuery.isLoading;
  const isFetching = showDeleted
    ? deletedQuery.isFetching
    : activeQuery.isFetching;

  const paged = productResult?.data;
  const products = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

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

  const deletedColumns = useDeletedProductColumns({
    pageIndex,
    pageSize,
    onRestore: setRestoreTarget,
  });

  const columns = showDeleted ? deletedColumns : activeColumns;

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

  return (
    <TablePageShell isFetching={isFetching} isLoading={isLoading}>
      <div className="px-4 pt-4">
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
                    className="text-[12px] h-7 px-2"
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
              className={TABLE_STYLES.toolbarBtn}
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
              className={TABLE_STYLES.toolbarBtn}
              onClick={() => handleToggleView(clearSelection)}
              title={
                showDeleted ? "Quay lại danh sách" : "Sản phẩm đã xóa"
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
                    className="mt-1 text-[12px]"
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
    </TablePageShell>
  );
}
