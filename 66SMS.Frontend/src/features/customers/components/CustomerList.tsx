import { CUSTOMER_PERM } from "@/features/customers/constants/customer.permissions";
import {
  useCustomers,
  useDeleteCustomer,
  useRestoreCustomer,
} from "@/features/customers/hooks/useCustomers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
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
import { Button } from "@/shared/elements/Button";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GENDER_OPTIONS, SOURCE_OPTIONS } from "../constants/customer.const";

interface Props {
  onCreate: () => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CustomerList({ onCreate, selectedId, onSelect }: Props) {
  const perm = CUSTOMER_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<CustomerDto | null>(null);

  const queryParams = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    status: showDeleted ? StatusActive.Deleted : StatusActive.Active,
    gender: selectedGender ?? undefined,
    source: selectedSource ?? undefined,
  };

  // Query lấy danh sách khách hàng
  const { data: customersResult, isLoading } = useCustomers(queryParams);

  // Gọi Hook Api
  const deleteMutation = useDeleteCustomer();
  const restoreMutation = useRestoreCustomer();

  // Lấy dữ liệu từ query
  const paged = customersResult?.data;
  const customers = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);

  // Debounce search 300ms
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  // Xử lý khi nhấn vào nút xem khách hàng đã xóa
  function handleToggleView() {
    setShowDeleted(!showDeleted);
    setPageIndex(1);
    setSearchText("");
    setFilter("");
    setSelectedGender(null);
    setSelectedSource(null);
  }

  // Xử lý khi chọn số dòng mỗi trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // Xử lý khi chọn giới tính
  function handleSelectGender(value: string) {
    setSelectedGender(value === "all" ? null : Number(value));
    setPageIndex(1);
  }

  // Xử lý khi chọn nguồn khách
  function handleSelectSource(value: string) {
    setSelectedSource(value === "all" ? null : value);
    setPageIndex(1);
  }

  // Xử lý khi nhấn vào nút xóa khách hàng
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  // Xử lý khi nhấn vào nút khôi phục khách hàng
  function handleRestore() {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setRestoreTarget(null);
      },
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-kit bg-kit-white shadow-kit-card">
      <div className="shrink-0 border-b border-kit">
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kit-muted" />

              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm tên, số điện thoại..."
                inputSize="sm"
                className="mb-0 h-9 pl-9"
              />
            </div>

            {/* Advanced filter */}
            <Tooltip text="Bộ lọc nâng cao">
              <Button
                type="button"
                variant={showAdvancedFilter ? "outline-primary" : "outline"}
                size="icon-sm"
                className="mb-0 mr-0 shrink-0"
                onClick={() => setShowAdvancedFilter((prev) => !prev)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </Tooltip>

            {/* Deleted */}
            <PermissionGate
              resource={perm.resource}
              action={perm.read}
              role={perm.role}
            >
              <Tooltip
                text={
                  showDeleted
                    ? "Quay lại danh sách khách hàng"
                    : "Xem khách hàng đã xóa"
                }
              >
                <Button
                  type="button"
                  variant={showDeleted ? "outline-warning" : "outline"}
                  size="icon-sm"
                  className="mb-0 mr-0 shrink-0"
                  onClick={handleToggleView}
                >
                  {showDeleted ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </Tooltip>
            </PermissionGate>
          </div>

          {showAdvancedFilter && (
            <div className="rounded-md border border-kit bg-kit-page/40 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-kit-heading">
                  Bộ lọc nâng cao
                </span>

                <button
                  type="button"
                  className="text-2xs text-kit-muted hover:text-kit-heading"
                  onClick={() => {
                    handleSelectGender("all");
                    handleSelectSource("all");
                  }}
                >
                  Xóa lọc
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <label className="mb-1 block text-2xs font-semibold uppercase text-kit-muted">
                    Giới tính
                  </label>

                  <Select
                    value={
                      selectedGender === null ? "all" : String(selectedGender)
                    }
                    onChange={(event) => handleSelectGender(event.target.value)}
                    options={GENDER_OPTIONS}
                    inputSize="sm"
                    className="mb-0"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-2xs font-semibold uppercase text-kit-muted">
                    Nguồn khách
                  </label>

                  <Select
                    value={selectedSource ?? "all"}
                    onChange={(event) => handleSelectSource(event.target.value)}
                    options={SOURCE_OPTIONS}
                    inputSize="sm"
                    className="mb-0"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {!showDeleted && (
              <PermissionGate
                resource={perm.resource}
                action={perm.create}
                role={perm.role}
              >
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="mb-0 mr-0 shrink-0 flex-1"
                  onClick={onCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm khách</span>
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full min-h-40 items-center justify-center">
            <p className="text-sm text-kit-muted">Đang tải...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-kit-page">
              <User className="h-5 w-5 text-kit-muted" />
            </div>

            <p className="text-sm font-medium text-kit-heading">
              {showDeleted
                ? "Không có khách hàng đã xóa"
                : "Chưa có khách hàng"}
            </p>

            <p className="mt-1 max-w-55 text-xs text-kit-muted">
              {showDeleted
                ? "Danh sách khách hàng đã xóa hiện đang trống."
                : "Hãy thêm khách hàng đầu tiên để bắt đầu quản lý."}
            </p>

            {!showDeleted && (
              <PermissionGate
                resource={perm.resource}
                action={perm.create}
                role={perm.role}
              >
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  className="mt-3 mb-0 mr-0"
                  onClick={onCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm khách hàng
                </Button>
              </PermissionGate>
            )}
          </div>
        ) : (
          <ListGroup flush>
            {customers.map((customer: CustomerDto) => {
              const isSelected = customer.id === selectedId;
              return (
                <ListGroupItem
                  key={customer.id}
                  action
                  active={isSelected}
                  onClick={() => {
                    if (customer.id) {
                      onSelect(customer.id);
                    }
                  }}
                  className={`
                    relative gap-3 border-b border-kit px-3 py-2.5
                    transition-colors last:border-b-0
                  `}
                >
                  <div className="flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-full border border-kit bg-kit-page">
                    <FallbackImage
                      kind="customer"
                      src={customer.avatarUrl}
                      alt={customer.fullName}
                      className="h-15 w-15 object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`
                          min-w-0 flex-1 truncate text-sm font-semibold
                        `}
                      >
                        {customer.fullName}
                      </span>
                    </div>

                    <div className="mt-0.5 flex min-w-0 flex-col gap-0.5 text-xs">
                      {customer.phone && (
                        <span className="truncate">{customer.phone}</span>
                      )}

                      {customer.email && (
                        <span className="truncate">{customer.email}</span>
                      )}
                    </div>
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </div>

      {totalCount > PAGE_SIZE_OPTIONS[0] && (
        <div className="shrink-0 border-t border-kit bg-kit-white px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <Select
              inputSize="sm"
              className="mb-0 w-20"
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

            {/* Pagination */}
            <Pagination
              page={safePage}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              size="sm"
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa khách hàng"
        description={`Bạn có chắc muốn xóa khách hàng "${deleteTarget?.fullName}"?`}
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
        title="Khôi phục khách hàng"
        description={`Bạn có chắc muốn khôi phục khách hàng "${restoreTarget?.fullName}"?`}
        confirmLabel="Khôi phục"
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}
