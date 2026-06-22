import { useState, useCallback, useMemo } from "react";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Package,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
} from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
// import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { ProductDetailExpanded } from "../components/ProductDetailExpanded";
import { useAdminProducts, useDeleteProduct } from "../hooks/useProducts";
import type { ProductDto } from "../types/product.types";

// ---- Constants ----

const PRODUCT_STATUS_MAP: StatusMap = {
  "0": { label: "Ngừng bán", variant: "error" },
  "1": { label: "Đang bán", variant: "success", dot: true },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export function ProductListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);

  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  const {
    data: productsResult,
    isLoading,
    isFetching,
  } = useAdminProducts({
    pageIndex,
    pageSize,
    keyword: filter || undefined,
    orderBy,
    isDescending,
  });
  const deleteMutation = useDeleteProduct();

  const paged = productsResult?.data;
  const products = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const currentPageIds = useMemo(
    () =>
      products.map((p) => p.id).filter((id): id is number => id !== undefined),
    [products],
  );
  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedRowIds.has(id));
  const isSomeSelected = currentPageIds.some((id) => selectedRowIds.has(id));
  const headerChecked = isAllSelected
    ? true
    : isSomeSelected
      ? "indeterminate"
      : false;

  const handleSort = useCallback(
    (column: string) => {
      if (orderBy === column) {
        setIsDescending((prev) => !prev);
      } else {
        setOrderBy(column);
        setIsDescending(false);
      }
    },
    [orderBy],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilter(value);
    setPageIndex(1);
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTarget?.id) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
    }
  }, [deleteTarget, deleteMutation]);

  const SortIcon = useCallback(
    ({ column }: { column: string }) => {
      if (orderBy !== column)
        return <ArrowUpDown className="w-3 h-3 opacity-40" />;
      return isDescending ? (
        <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      ) : (
        <ArrowUp className="w-3 h-3 text-lotus-leaf" />
      );
    },
    [orderBy, isDescending],
  );

  const columns = useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={headerChecked}
            onCheckedChange={(checked) => {
              const newSet = new Set(selectedRowIds);
              if (headerChecked === "indeterminate" || checked === false) {
                currentPageIds.forEach((id) => newSet.delete(id));
              } else if (checked === true) {
                currentPageIds.forEach((id) => newSet.add(id));
              }
              setSelectedRowIds(newSet);
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <Checkbox
              checked={prod.id !== undefined && selectedRowIds.has(prod.id)}
              onCheckedChange={(checked) => {
                if (prod.id === undefined) return;
                const newSet = new Set(selectedRowIds);
                if (checked) newSet.add(prod.id);
                else newSet.delete(prod.id);
                setSelectedRowIds(newSet);
              }}
              aria-label={`Select row`}
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 40,
        enableResizing: false,
      },
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "code",
        header: "Mã SP",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80 font-medium">
            {row.original.code ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "name",
        header: () => (
          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Tên sản phẩm <SortIcon column="name" />
          </button>
        ),
        cell: ({ row }) => {
          const prod = row.original;
          const primaryImage = prod.images?.find((img) => img.isPrimary)?.url;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt=""
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <Package className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-lotus-deep truncate max-w-[180px]">
                {prod.name ?? "—"}
              </span>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "categoryName",
        header: "Danh mục",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">
            {row.original.categoryName ?? "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "stockQuantity",
        header: () => (
          <button
            onClick={() => handleSort("stockquantity")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Tồn kho <SortIcon column="stockquantity" />
          </button>
        ),
        cell: ({ row }) => {
          const stock = row.original.stockQuantity ?? 0;
          const minStock = row.original.minStock ?? 0;
          const isLowStock = stock <= minStock;
          return (
            <span
              className={`font-semibold ${isLowStock ? "text-red-500" : "text-lotus-deep"}`}
            >
              {stock}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "unit",
        header: "Đơn vị",
        cell: ({ row }) => (
          <span className="text-lotus-deep/70">{row.original.unit ?? "—"}</span>
        ),
        size: 80,
      },
      {
        accessorKey: "sellingPrice",
        header: "Giá bán",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep">
            {row.original.sellingPrice != null
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(row.original.sellingPrice)
              : "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status?.toString()}
            statusMap={PRODUCT_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  {/* <PermissionGate resource="products" action="update"> */}
                  <DropdownMenuItem onClick={() => setEditProduct(prod)}>
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {/* </PermissionGate> */}
                  {/* <PermissionGate resource="products" action="delete" role="admin"> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(prod)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa sản phẩm
                  </DropdownMenuItem>
                  {/* </PermissionGate> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [
      headerChecked,
      selectedRowIds,
      currentPageIds,
      pageIndex,
      pageSize,
      handleSort,
      SortIcon,
    ],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden"
      >
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm theo tên, mã sản phẩm..."
          >
            {selectedRowIds.size > 0 && (
              <div className="flex items-center gap-2 mr-auto text-[13px] text-lotus-deep font-medium bg-lotus-cream/50 px-3 py-1.5 rounded-lg border border-stone-200/50">
                <span>Đã chọn {selectedRowIds.size}</span>
                <button
                  onClick={() => setSelectedRowIds(new Set())}
                  className="text-lotus-stone hover:text-lotus-deep ml-1 transition-colors"
                  title="Bỏ chọn tất cả"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <DataTableViewOptions
              table={table}
              columnLabels={{
                code: "Mã SP",
                name: "Tên sản phẩm",
                categoryName: "Danh mục",
                stockQuantity: "Tồn kho",
                unit: "Đơn vị",
                sellingPrice: "Giá bán",
                status: "Trạng thái",
              }}
            />

            {/* <PermissionGate resource="products" action="create"> */}
            <Button
              variant="admin"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-[12px] gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm SP
            </Button>
            {/* </PermissionGate> */}
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) =>
            row.original.id ? (
              <ProductDetailExpanded
                productId={row.original.id}
                onEdit={(product) => setEditProduct(product)}
              />
            ) : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <Package className="w-7 h-7 text-lotus-stone" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có sản phẩm
                </p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thêm sản phẩm mới để bắt đầu quản lý kho.
                </p>
              </div>
              {/* <PermissionGate resource="products" action="create"> */}
              <Button
                variant="admin"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-1 text-[12px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm sản phẩm
              </Button>
              {/* </PermissionGate> */}
            </div>
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

        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(open) => {
          if (!open) setEditProduct(null);
        }}
        product={editProduct}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        description={`Bạn có chắc muốn xóa sản phẩm "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.div>
  );
}
