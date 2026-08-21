import { SalonDetailExpanded } from "@/features/salons/components/SalonDetailExpanded";
import { SalonStatusBadge } from "@/features/salons/components/SalonStatusBadge";
import { SALON_PERM } from "@/features/salons/constants/salon.permissions";
import {
  useDeleteSalon,
  useSalonsAdmin,
} from "@/features/salons/hooks/useSalons";
import type { SalonDto } from "@/features/salons/types/salon.types";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
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
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa
// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: SalonDto) => void;
  onCreate: () => void;
}

export function SalonTable({ onEdit, onCreate }: Props) {
  const perm = SALON_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalonDto | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const queryParams = {
    pageIndex,
    pageSize,
    // BE lọc theo filter (tên, mã, SĐT), không dùng keyword
    filter: filter || undefined,
    orderBy,
    isDescending,
  };

  const currentQuery = useSalonsAdmin(queryParams);

  const paged = currentQuery.data?.data;
  const salons = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const deleteMutation = useDeleteSalon();

  // Giải thích:
  // Đợi 300ms sau khi gõ mới gửi filter lên API, tránh gọi liên tục
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

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
  // handleToggleExpand: Mở/đóng chi tiết một dòng
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  // Giải thích:
  // handleDelete: Hàm xử lý khi nhấn vào nút xóa chi nhánh
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  const emptyColSpan = 8;

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên, mã, Số điện thoại..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <PermissionGate
            resource={perm.resource}
            action={perm.create}
            role={perm.role}
          >
            <Button
              variant="admin"
              size="sm"
              className="mb-0 mr-0 h-9"
              onClick={onCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm chi nhánh
            </Button>
          </PermissionGate>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell className="w-12">#</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Mã"
                    column="code"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Tên chi nhánh"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Số điện thoại</TableHeaderCell>
                <TableHeaderCell>Địa chỉ</TableHeaderCell>
                <TableHeaderCell>Trụ sở chính</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
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
              ) : salons.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có chi nhánh
                  </TableCell>
                </TableRow>
              ) : (
                salons.map((item, rowIndex) => (
                  <Fragment key={item.id}>
                    <TableRow
                      className={
                        expandedId === item.id
                          ? "relative z-10 cursor-pointer border-x-2 border-t-2 border-kit-primary [&>td]:bg-kit-white!"
                          : item.id != null
                            ? "cursor-pointer"
                            : undefined
                      }
                      onClick={() => {
                        if (item.id == null) return;
                        handleToggleExpand(item.id);
                      }}
                    >
                      <TableCell className="text-kit-muted">
                        {(safePage - 1) * pageSize + rowIndex + 1}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" soft>
                          {item.code ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-kit-heading">
                        {item.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.phone ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-kit-muted">
                        {item.fullAddress || item.streetAddress || "—"}
                      </TableCell>
                      <TableCell>
                        {item.isPrimary === true ? (
                          <Badge variant="success" soft>
                            Trụ sở chính
                          </Badge>
                        ) : (
                          <span className="text-xs text-kit-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <SalonStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>

                    {expandedId === item.id && item.id != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <SalonDetailExpanded
                            salonId={item.id}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa chi nhánh"
        description={`Bạn có chắc muốn xóa chi nhánh "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
