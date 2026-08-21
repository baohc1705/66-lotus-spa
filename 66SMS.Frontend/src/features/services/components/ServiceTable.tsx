import { ServiceDetailExpanded } from "@/features/services/components/ServiceDetailExpanded";
import { ServiceStatCards } from "@/features/services/components/ServiceStatCards";
import { SERVICE_PERM } from "@/features/services/constants/service.permissions";
import {
  useDeleteBulkServices,
  useDeleteService,
  useRestoreService,
  useServicesAdmin,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Badge } from "@/shared/elements/Badge";
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
import { formatCurrency } from "@/shared/utils/currency";
import { formatDateTimeDisplay } from "@/shared/utils/date.utils";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";

// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa
// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: ServiceDto) => void;
  onCreate: () => void;
}

export function ServiceTable({ onEdit, onCreate }: Props) {
  const perm = SERVICE_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ServiceDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ServiceDto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const { data: categoriesResult } = useServiceCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  const queryParams = {
    pageIndex,
    pageSize,
    // BE lọc theo keyword (tên, mã), không dùng filter
    keyword: filter || undefined,
    orderBy,
    isDescending,
    categoryId: selectedCategoryId ?? undefined,
  };

  // Giải thích:
  // activeQuery: Query lấy danh sách dịch vụ hoạt động
  // deletedQuery: Query lấy danh sách dịch vụ đã xóa
  // currentQuery: Query lấy danh sách dịch vụ hiện tại
  const activeQuery = useServicesAdmin(queryParams, !showDeleted);
  const deletedQuery = useServicesAdmin(
    { ...queryParams, isDeleted: true },
    showDeleted,
  );
  const currentQuery = showDeleted ? deletedQuery : activeQuery;

  const paged = currentQuery.data?.data;
  const services = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  // Giải thích:
  // safePage là trang hiện tại, nếu pageIndex lớn hơn totalPages thì sẽ đặt là totalPages
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Giải thích:
  // Đếm số liệu trên trang hiện tại để hiện 4 thẻ StatCards (đang KD, có ảnh, thời lượng TB)
  let activeServiceCount = 0;
  let servicesWithImage = 0;
  let durationSum = 0;
  let durationCount = 0;
  for (let index = 0; index < services.length; index++) {
    const item = services[index];
    if (item.status === StatusActive.Active) activeServiceCount += 1;
    if (item.imageUrl) servicesWithImage += 1;
    if ((item.durationMins ?? 0) > 0) {
      durationSum += item.durationMins ?? 0;
      durationCount += 1;
    }
  }
  // Giải thích:
  // avgDurationMins: Thời lượng trung bình của dịch vụ
  const avgDurationMins =
    durationCount === 0 ? 0 : Math.round(durationSum / durationCount);

  // Giải thích:
  // updateMutation: Cập nhật trạng thái dịch vụ
  // deleteMutation: Xóa một dịch vụ
  // deleteBulkMutation: Xóa nhiều dịch vụ đã chọn
  // restoreMutation: Khôi phục dịch vụ đã xóa
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const deleteBulkMutation = useDeleteBulkServices();
  const restoreMutation = useRestoreService();

  // Giải thích:
  // Đợi 300ms sau khi gõ mới gửi keyword lên API, tránh gọi liên tục
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  // Giải thích:
  // allChecked: Kiểm tra xem tất cả dịch vụ trên trang đã được chọn hay không
  const allChecked =
    services.length > 0 && selectedIds.length === services.length;

  // Giải thích:
  // handlePageSizeChange: Hàm xử lý khi chọn số dòng mỗi trang
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
  // handleToggleView: Hàm xử lý khi nhấn vào nút xem dịch vụ đã xóa
  function handleToggleView() {
    setShowDeleted(!showDeleted);
    setSelectedIds([]);
    setPageIndex(1);
    setSearchText("");
    setFilter("");
    setExpandedId(null);
  }

  // Giải thích:
  // handleCategoryChange: Lọc danh sách theo nhóm dịch vụ, về trang 1
  function handleCategoryChange(value: string) {
    if (!value) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(Number(value));
    }
    setPageIndex(1);
    setSelectedIds([]);
    setExpandedId(null);
  }

  // Giải thích:
  // handleToggleExpand: Mở/đóng chi tiết một dòng, chỉ mở một dòng tại một thời điểm
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  // Giải thích:
  // handleToggleOne: Hàm xử lý khi chọn một dịch vụ
  function handleToggleOne(id: number, checked: boolean) {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
      return;
    }
    const next: number[] = [];
    for (let index = 0; index < selectedIds.length; index++) {
      if (selectedIds[index] === id) continue;
      next.push(selectedIds[index]);
    }
    setSelectedIds(next);
  }

  // Giải thích:
  // handleToggleAll: Hàm xử lý khi chọn tất cả dịch vụ
  function handleToggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    const ids: number[] = [];
    for (let index = 0; index < services.length; index++) {
      const id = services[index].id;
      if (id == null) continue;
      ids.push(id);
    }
    setSelectedIds(ids);
  }

  // Giải thích:
  // handleToggleStatus: Hàm xử lý khi bật/tắt trạng thái dịch vụ
  function handleToggleStatus(item: ServiceDto, checked: boolean) {
    if (!item.id) return;
    const status = checked ? StatusActive.Active : StatusActive.Inactive;
    updateMutation.mutate({ id: item.id, data: { status } });
  }

  // Giải thích:
  // handleDelete: Hàm xử lý khi nhấn vào nút xóa dịch vụ
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  // Giải thích:
  // handleBulkDelete: Hàm xử lý khi nhấn vào nút xóa đã chọn
  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    deleteBulkMutation.mutate(selectedIds, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        setBulkDeleteOpen(false);
        setSelectedIds([]);
      },
    });
  }

  // Giải thích:
  // handleRestore: Hàm xử lý khi nhấn vào nút khôi phục dịch vụ
  function handleRestore() {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setRestoreTarget(null);
      },
    });
  }

  // Giải thích:
  // emptyColSpan: Số cột khi bảng trống (thùng rác ít cột hơn vì không có checkbox và trạng thái)
  const emptyColSpan = showDeleted ? 8 : 10;

  return (
    <div className="space-y-0 pb-6">
      <ServiceStatCards
        totalServices={totalCount}
        activeServices={activeServiceCount}
        servicesWithImage={servicesWithImage}
        avgDurationMins={avgDurationMins}
        isLoading={currentQuery.isLoading}
      />

      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        {/* Toolbar của bảng */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm dịch vụ..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              inputSize="sm"
              className="mb-0 mr-0 h-9 w-52"
              value={selectedCategoryId ? String(selectedCategoryId) : ""}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              <option value="">Tất cả nhóm dịch vụ</option>
              {categories.map((category: ServiceCategoryDto) => (
                <option
                  key={category.id}
                  value={category.id?.toString() || ""}
                >
                  {category.name}
                </option>
              ))}
            </Select>
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
                Thêm dịch vụ
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

        {/* Bảng */}
        <TableResponsive>
          <Table hover striped>
            {/* Header của bảng */}
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
                    label="Mã dịch vụ"
                    column="code"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Ảnh</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Tên dịch vụ"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Nhóm dịch vụ"
                    column="category"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Giá bán"
                    column="sellingprice"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Thời gian"
                    column="durationmins"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                {!showDeleted ? (
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                ) : null}
                <TableHeaderCell>
                  {showDeleted ? (
                    "Ngày xóa"
                  ) : (
                    <SortableColumnHeader
                      label="Ngày tạo"
                      column="createdAt"
                      orderBy={orderBy}
                      isDescending={isDescending}
                      onSort={handleSort}
                      onPrimary
                    />
                  )}
                </TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>

            {/* Body của bảng */}
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
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    {showDeleted
                      ? "Không có dịch vụ đã xóa"
                      : "Chưa có dịch vụ"}
                  </TableCell>
                </TableRow>
              ) : (
                services.map((item) => (
                  // map ra 2 TableRow (dòng data + chi tiết). Fragment gom chúng vì tbody không bọc div; key đặt trên Fragment.
                  <Fragment key={item.id}>
                    {/* Dòng data */}
                    <TableRow
                      className={
                        expandedId === item.id
                          ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                          : !showDeleted && item.id != null
                            ? "cursor-pointer"
                            : undefined
                      }
                      onClick={() => {
                        if (showDeleted || item.id == null) return;
                        handleToggleExpand(item.id);
                      }}
                    >
                      {!showDeleted ? (
                        <TableCell>
                          <div onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              className="mb-0"
                              checked={
                                item.id != null && selectedIds.includes(item.id)
                              }
                              onChange={(checked: boolean) => {
                                if (item.id == null) return;
                                handleToggleOne(item.id, checked);
                              }}
                              aria-label="Select row"
                            />
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Badge variant="secondary" soft>
                          {item.code ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
                          <FallbackImage
                            kind="service"
                            src={item.imageUrl}
                            alt=""
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-kit-heading">
                        {item.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.categoryName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-kit-primary">
                        {formatCurrency(item.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.durationMins ? `${item.durationMins} phút` : "—"}
                      </TableCell>
                      {!showDeleted ? (
                        <TableCell>
                          <div onClick={(event) => event.stopPropagation()}>
                            <Switch
                              checked={item.status === StatusActive.Active}
                              onChange={(checked: boolean) =>
                                handleToggleStatus(item, checked)
                              }
                              disabled={updateMutation.isPending}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell className="text-kit-muted">
                        {formatDateTimeDisplay(
                          showDeleted ? item.updatedAt : item.createdAt,
                        )}
                      </TableCell>
                      <TableCell>
                        {showDeleted ? (
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
                                onClick={() => setRestoreTarget(item)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          </PermissionGate>
                        ) : (
                          <div
                            className="flex items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {item.id != null ? (
                              <Tooltip
                                text={
                                  expandedId === item.id
                                    ? "Đóng chi tiết"
                                    : "Xem chi tiết"
                                }
                              >
                                <Button
                                  size="icon-sm"
                                  variant="outline-info"
                                  className="mb-0 mr-0"
                                  onClick={() => handleToggleExpand(item.id!)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                            ) : null}
                            <PermissionGate
                              resource={perm.resource}
                              action={perm.update}
                              role={perm.role}
                            >
                              <Tooltip text="Sửa">
                                <Button
                                  size="icon-sm"
                                  variant="outline-primary"
                                  className="mb-0 mr-0"
                                  onClick={() => onEdit(item)}
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
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Chi tiết dịch vụ */}
                    {!showDeleted &&
                    expandedId === item.id &&
                    item.id != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <ServiceDetailExpanded
                            serviceId={item.id}
                            onEdit={onEdit}
                          />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {/* Phân trang */}
        {totalCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-kit-dark">
              <span>
                {rangeEnd} / {pageSize}
              </span>
              <span>Hiển thị: </span>
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

      {/* Dialog xóa nhiều dịch vụ */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Xóa dịch vụ đã chọn"
        description={`Bạn có chắc muốn xóa ${selectedIds.length} dịch vụ đã chọn?`}
        confirmLabel="Xóa"
        loading={deleteBulkMutation.isPending}
        variant="danger"
      />

      {/* Dialog xóa một dịch vụ */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa dịch vụ"
        description={`Bạn có chắc muốn xóa dịch vụ "${deleteTarget?.name}"?`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />

      {/* Dialog khôi phục dịch vụ */}
      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title="Khôi phục dịch vụ"
        description={`Bạn có chắc muốn khôi phục dịch vụ "${restoreTarget?.name}"? Dịch vụ sẽ hiển thị lại trong danh sách chính.`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
