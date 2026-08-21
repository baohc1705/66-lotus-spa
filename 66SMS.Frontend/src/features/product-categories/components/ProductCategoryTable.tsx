import { PRODUCT_CATEGORY_PERM } from "@/features/product-categories/constants/productCategory.permissions";
import {
  useDeleteBulkProductCategories,
  useDeleteProductCategory,
  useProductCategoriesAdmin,
  useRestoreProductCategory,
  useUpdateProductCategory,
} from "@/features/product-categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product-categories/types/productCategory.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { ArrowLeft, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa
// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: ProductCategoryDto) => void;
  onCreate: () => void;
}

export function ProductCategoryTable({ onEdit, onCreate }: Props) {
  const perm = PRODUCT_CATEGORY_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategoryDto | null>(
    null,
  );
  const [restoreTarget, setRestoreTarget] = useState<ProductCategoryDto | null>(
    null,
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const queryParams = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
  };

  // Giải thích:
  // activeQuery: Query lấy danh sách danh mục sản phẩm hoạt động
  // deletedQuery: Query lấy danh sách danh mục sản phẩm đã xóa
  // currentQuery: Query lấy danh sách danh mục sản phẩm hiện tại
  const activeQuery = useProductCategoriesAdmin(queryParams, !showDeleted);
  const deletedQuery = useProductCategoriesAdmin(
    { ...queryParams, isDeleted: true },
    showDeleted,
  );
  const currentQuery = showDeleted ? deletedQuery : activeQuery;

  const paged = currentQuery.data?.data;
  const categories = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  // Giải thích:
  // safePage là trang hiện tại, nếu pageIndex lớn hơn totalPages thì sẽ đặt là totalPages
  const safePage = Math.min(pageIndex, totalPages);
  //const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Giải thích:
  // updateMutation: Query lấy danh sách danh mục sản phẩm hoạt động
  // deleteMutation: Query lấy danh sách danh mục sản phẩm đã xóa
  // deleteMultiplesMutation: Query lấy danh sách danh mục sản phẩm hiện tại
  // restoreMutation: Query lấy danh sách danh mục sản phẩm hiện tại
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();
  const deleteMultiplesMutation = useDeleteBulkProductCategories();
  const restoreMutation = useRestoreProductCategory();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const allChecked =
    categories.length > 0 && selectedIds.length === categories.length;

  // Giải thích:
  // handlePageSizeChange: Hàm xử lý khi nhấn vào nút chọn số lượng trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // Giải thích:
  // handleSort: Hàm xử lý khi nhấn vào nút sắp xếp
  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  // Giải thích:
  // handleToggleView: Hàm xử lý khi nhấn vào nút xem danh mục đã xóa
  function handleToggleView() {
    setShowDeleted(!showDeleted);
    setSelectedIds([]);
    setPageIndex(1);
    setSearchText("");
    setFilter("");
  }

  // Giải thích:
  // handleToggleOne: Hàm xử lý khi nhấn vào nút chọn danh mục
  function handleToggleOne(id: number, checked: boolean) {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
      return;
    }
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  }

  // Giải thích:
  // handleToggleAll: Hàm xử lý khi nhấn vào nút chọn tất cả danh mục
  function handleToggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      categories
        .map((item) => item.id)
        .filter((id): id is number => id !== undefined),
    );
  }

  // Giải thích:
  // handleToggleStatus: Hàm xử lý khi nhấn vào nút chọn trạng thái danh mục
  function handleToggleStatus(item: ProductCategoryDto, checked: boolean) {
    if (!item.id) return;
    const status = checked ? StatusActive.Active : StatusActive.Inactive;
    updateMutation.mutate({ id: item.id, data: { status } });
  }

  // Giải thích:
  // handleDelete: Hàm xử lý khi nhấn vào nút xóa danh mục
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  // Giải thích:
  // handleBulkDelete: Hàm xử lý khi nhấn vào nút xóa đã chọn danh mục
  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    deleteMultiplesMutation.mutate(selectedIds, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        setBulkDeleteOpen(false);
        setSelectedIds([]);
      },
    });
  }

  // Giải thích:
  // handleRestore: Hàm xử lý khi nhấn vào nút khôi phục danh mục
  function handleRestore() {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setRestoreTarget(null);
      },
    });
  }

  const emptyColSpan = showDeleted ? 4 : 6;

  return (
    <div className="pb-6">
      <div className="overflow-hidden rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm danh mục..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <PermissionGate
              resource={perm.resource}
              action={perm.create}
              role={perm.role}
            >
              <Button
                variant="primary"
                size="sm"
                className="mb-0 mr-0 h-9"
                onClick={onCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm danh mục
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
                className="mb-0 mr-0 h-9"
                onClick={handleToggleView}
              >
                {showDeleted ? (
                  <>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Quay lại
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Khôi phục
                  </>
                )}
              </Button>
            </PermissionGate>

            {selectedIds.length > 0 && !showDeleted ? (
              <PermissionGate
                resource={perm.resource}
                action={perm.delete}
                role={perm.role}
              >
                <Button
                  variant="danger"
                  size="sm"
                  className="mb-0 mr-0 h-9"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa đã chọn ({selectedIds.length})
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                {!showDeleted ? (
                  <TableHeaderCell className="w-10">
                    <Checkbox
                      className="mb-0"
                      checked={allChecked}
                      onChange={handleToggleAll}
                      aria-label="Select all"
                    />
                  </TableHeaderCell>
                ) : null}
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Tên danh mục"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Mô tả</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Thứ tự"
                    column="sortOrder"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                {!showDeleted ? (
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                ) : null}
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    {showDeleted
                      ? "Không có danh mục đã xóa"
                      : "Chưa có danh mục sản phẩm"}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((item) => (
                  <TableRow key={item.id}>
                    {!showDeleted ? (
                      <TableCell>
                        <Checkbox
                          className="mb-0"
                          checked={
                            item.id !== undefined &&
                            selectedIds.includes(item.id)
                          }
                          onChange={(checked: boolean) => {
                            if (item.id === undefined) return;
                            handleToggleOne(item.id, checked);
                          }}
                          aria-label="Select row"
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="font-medium text-kit-dark">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-kit-muted">
                      {item.sortOrder}
                    </TableCell>
                    {!showDeleted ? (
                      <TableCell>
                        <Switch
                          checked={item.status === StatusActive.Active}
                          onChange={(checked: boolean) =>
                            handleToggleStatus(item, checked)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      {showDeleted ? (
                        <PermissionGate
                          resource={perm.resource}
                          action={perm.update}
                          role={perm.role}
                        >
                          <Button
                            size="icon-sm"
                            variant="outline-success"
                            className="mb-0 mr-0"
                            onClick={() => setRestoreTarget(item)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGate>
                      ) : (
                        <div className="flex items-center gap-1">
                          <PermissionGate
                            resource={perm.resource}
                            action={perm.update}
                            role={perm.role}
                          >
                            <Button
                              size="icon-sm"
                              variant="outline-primary"
                              className="mb-0 mr-0"
                              onClick={() => onEdit(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate
                            resource={perm.resource}
                            action={perm.delete}
                            role={perm.role}
                          >
                            <Button
                              size="icon-sm"
                              variant="outline-danger"
                              className="mb-0 mr-0"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGate>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {totalCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-kit-dark">
              <span>
                {rangeEnd} / {totalCount}
              </span>
              <Select
                inputSize="sm"
                className="mb-0 w-28"
                value={pageSize}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
            <Pagination
              page={safePage}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              size="sm"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Xóa danh mục đã chọn"
        description={`Bạn có chắc muốn xóa ${selectedIds.length} danh mục đã chọn?`}
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
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name ?? ""}"?`}
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
        title="Khôi phục danh mục"
        description={`Bạn có chắc muốn khôi phục danh mục "${restoreTarget?.name ?? ""}"? Danh mục sẽ hiển thị lại trong danh sách chính.`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
