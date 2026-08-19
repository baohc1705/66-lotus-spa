import { useEffect, useState } from "react";
import { CERTIFICATE_PERM } from "@/features/certificates/constants/certificate.permissions";
import type { CertificateTypeDto } from "@/features/certificates/types/certificateType.types";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import {
  useCertificateTypes,
  useDeleteCertificateType,
} from "@/features/certificates/hooks/useCertificateTypes";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/shared/forms/Input";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { Badge } from "@/shared/elements/Badge";
import { Tooltip } from "@/shared/components/Tooltip";
import { Select } from "@/shared/forms/Select";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

// onCreate: mở form thêm loại chứng chỉ
interface Props {
  onEdit: (item: CertificateTypeDto) => void;
  onCreate: () => void;
}

export function CertificateTypeTable({ onEdit, onCreate }: Props) {
  const perm = CERTIFICATE_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificateTypeDto | null>(
    null,
  );

  const queryParams = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
  };

  const { data: result, isLoading } = useCertificateTypes(queryParams);
  const deleteMutation = useDeleteCertificateType();

  const paged = result?.data;
  const items = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Đợi 300ms sau khi gõ mới gửi filter lên API
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  function handleSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
      return;
    }
    setOrderBy(column);
    setIsDescending(false);
  }

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  const emptyColSpan = 6;

  return (
    <div className="space-y-0 pb-6">
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo tên, mã..."
              inputSize="sm"
              className="mb-0 h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <PermissionGate resource={perm.resource} action={perm.create}>
              <Button
                variant="primary"
                size="sm"
                className="mb-0 mr-0 h-9"
                onClick={onCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm loại chứng chỉ
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Bảng */}
        <TableResponsive>
          <Table hover striped>
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell className="w-14">#</TableHeaderCell>
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
                    label="Tên loại chứng chỉ"
                    column="name"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Mô tả</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có loại chứng chỉ
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-kit-muted">
                      {(safePage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-kit-page px-1.5 py-0.5 font-mono text-xs font-medium text-kit-heading">
                        {item.code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-kit-heading">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 1 ? "success" : "secondary"}
                        soft
                      >
                        {item.status === 1 ? "Hoạt động" : "Tạm đóng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <PermissionGate
                          resource={perm.resource}
                          action={perm.update}
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

      {/* Dialog xóa */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa loại chứng chỉ"
        description={`Bạn có chắc muốn xóa loại chứng chỉ "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
