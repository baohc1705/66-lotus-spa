import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  Eye,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product_categories/types/productCategory.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { useRowSelection } from "@/shared/hooks/useRowSelection";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";

import { ProductCategorySidebar } from "../components/ProductCategorySidebar";
import { ProductDetailExpanded } from "../components/ProductDetailExpanded";
import { ProductFormDialog } from "../components/ProductFormDialog";
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

const COLUMN_LABELS = {
  code: "Mã SP",
  imageUrl: "Ảnh",
  name: "Tên sản phẩm",
  categoryName: "Danh mục",
  stockQuantity: "Tồn kho",
  unit: "Đơn vị",
  sellingPrice: "Giá bán",
  status: "Trạng thái",
};

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

  const columns = useMemo(() => {
    const cols: ColumnDef<ProductDto>[] = [];

    if (!showDeleted) {
      cols.push({
        id: "select",
        header: () => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              className="mb-0"
              checked={headerChecked === true}
              indeterminate={headerChecked === "indeterminate"}
              onChange={(checked: boolean) => toggleAll(checked)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                className="mb-0"
                checked={item.id != null && selectedRowIds.has(item.id)}
                onChange={(checked: boolean) => {
                  if (item.id == null) return;
                  toggleOne(item.id, checked);
                }}
                aria-label="Select row"
              />
            </div>
          );
        },
        size: 40,
        enableResizing: false,
      });
    }

    cols.push(
      {
        accessorKey: "code",
        header: () =>
          showDeleted ? (
            COLUMN_LABELS.code
          ) : (
            <SortableColumnHeader
              label={COLUMN_LABELS.code}
              column="code"
              orderBy={orderBy}
              isDescending={isDescending}
              onSort={handleSort}
              onPrimary
            />
          ),
        cell: ({ row }) => (
          <Badge variant="secondary" soft>
            {row.original.code ?? "—"}
          </Badge>
        ),
        size: 100,
      },
      {
        id: "imageUrl",
        accessorKey: "imageUrl",
        header: COLUMN_LABELS.imageUrl,
        cell: ({ row }) => (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
            <FallbackImage
              kind="product"
              src={row.original.imageUrl}
              alt=""
              className="h-10 w-10 object-cover"
            />
          </div>
        ),
        size: 72,
        enableResizing: false,
      },
      {
        accessorKey: "name",
        header: () =>
          showDeleted ? (
            COLUMN_LABELS.name
          ) : (
            <SortableColumnHeader
              label={COLUMN_LABELS.name}
              column="name"
              orderBy={orderBy}
              isDescending={isDescending}
              onSort={handleSort}
              onPrimary
            />
          ),
        cell: ({ row }) => (
          <span className="font-medium text-kit-heading">
            {row.original.name ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "categoryName",
        header: COLUMN_LABELS.categoryName,
        cell: ({ row }) => (
          <span className="text-kit-muted">
            {row.original.categoryName ?? "—"}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "stockQuantity",
        header: () =>
          showDeleted ? (
            COLUMN_LABELS.stockQuantity
          ) : (
            <SortableColumnHeader
              label={COLUMN_LABELS.stockQuantity}
              column="stockquantity"
              orderBy={orderBy}
              isDescending={isDescending}
              onSort={handleSort}
              onPrimary
            />
          ),
        cell: ({ row }) => {
          const stock = row.original.stockQuantity ?? 0;
          const minStock = row.original.minStock ?? 0;
          const isLowStock = stock <= minStock;
          return (
            <span
              className={`font-semibold ${isLowStock ? "text-kit-danger" : "text-kit-heading"}`}
            >
              {stock}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "unit",
        header: COLUMN_LABELS.unit,
        cell: ({ row }) => (
          <span className="text-kit-muted">{row.original.unit ?? "—"}</span>
        ),
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: () =>
          showDeleted ? (
            COLUMN_LABELS.sellingPrice
          ) : (
            <SortableColumnHeader
              label={COLUMN_LABELS.sellingPrice}
              column="sellingPrice"
              orderBy={orderBy}
              isDescending={isDescending}
              onSort={handleSort}
              onPrimary
            />
          ),
        cell: ({ row }) => (
          <span className="text-sm font-bold text-kit-primary">
            {formatCurrency(row.original.sellingPrice)}
          </span>
        ),
        size: 120,
      },
    );

    if (!showDeleted) {
      cols.push(
        {
          accessorKey: "status",
          header: COLUMN_LABELS.status,
          cell: ({ row }) => {
            const item = row.original;
            return (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center"
              >
                <Switch
                  checked={item.status === StatusActive.Active}
                  onChange={(checked: boolean) => {
                    if (!item.id) return;
                    updateMutation.mutate({
                      id: item.id,
                      payload: {
                        status: checked
                          ? StatusActive.Active
                          : StatusActive.Inactive,
                      },
                    });
                  }}
                  disabled={updateMutation.isPending}
                />
              </div>
            );
          },
          size: 100,
        },
        {
          id: "actions",
          header: "Thao tác",
          cell: ({ row }) => {
            const item = row.original;
            const expanded = row.getIsExpanded();
            return (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip text={expanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                  <Button
                    size="icon-sm"
                    variant="outline-info"
                    className="mb-0 mr-0"
                    onClick={() => row.toggleExpanded()}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <PermissionGate resource={perm.resource} action={perm.update}>
                  <Tooltip text="Sửa">
                    <Button
                      size="icon-sm"
                      variant="outline-primary"
                      className="mb-0 mr-0"
                      onClick={() => setEditTarget(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Tooltip>
                </PermissionGate>
                <PermissionGate
                  resource={perm.resource}
                  action={perm.delete}
                  role={perm.role}
                >
                  <Tooltip text="Xóa">
                    <Button
                      size="icon-sm"
                      variant="outline-danger"
                      className="mb-0 mr-0"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Tooltip>
                </PermissionGate>
              </div>
            );
          },
          size: 130,
          enableResizing: false,
        },
      );
    } else {
      cols.push(
        {
          accessorKey: "updatedAt",
          header: "Ngày xóa",
          cell: ({ row }) => (
            <span className="text-kit-muted">
              {formatDateTimeDisplay(row.original.updatedAt)}
            </span>
          ),
          size: 140,
        },
        {
          id: "actions",
          header: "Thao tác",
          cell: ({ row }) => (
            <PermissionGate
              resource={perm.resource}
              action={perm.update}
              role={perm.role}
            >
              <Tooltip text="Khôi phục">
                <Button
                  size="icon-sm"
                  variant="outline-success"
                  className="mb-0 mr-0"
                  onClick={() => setRestoreTarget(row.original)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </PermissionGate>
          ),
          size: 80,
          enableResizing: false,
        },
      );
    }

    return cols;
  }, [
    showDeleted,
    orderBy,
    isDescending,
    handleSort,
    headerChecked,
    selectedRowIds,
    toggleAll,
    toggleOne,
    updateMutation,
    setEditTarget,
    setDeleteTarget,
    setRestoreTarget,
    perm,
  ]);

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

  const { layoutMode } = useOutletContext<{
    layoutMode: "top-nav" | "sidebar";
  }>();
  const isSidebarMode = layoutMode === "sidebar";

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      {/* <ProductStatCards
        totalProducts={totalCount}
        activeProducts={activeProductCount}
        totalStock={totalStock}
        isLoading={isLoading}
      /> */}

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
                    columnLabels={COLUMN_LABELS}
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
                        Quay lại
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Khôi phục
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
                  />
                ) : (
                  <TableEmptyState
                    icon={Package}
                    title="Chưa có sản phẩm"
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
        description={`Bạn có chắc muốn xóa ${ENTITY} "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={`Khôi phục ${ENTITY_SUBJECT}`}
        description={`Bạn có chắc muốn khôi phục ${ENTITY_SUBJECT} "${restoreTarget?.name ?? ""}"? ${ENTITY_SUBJECT} sẽ hiển thị lại trong danh sách chính.`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
