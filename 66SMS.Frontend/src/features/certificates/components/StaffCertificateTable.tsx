import { CERTIFICATE_PERM } from "@/features/certificates/constants/certificate.permissions";
import { useCertificateTypes } from "@/features/certificates/hooks/useCertificateTypes";
import {
  useDeleteStaffCertificate,
  useStaffCertificates,
  useUpdateStaffCertificate,
} from "@/features/certificates/hooks/useStaffCertificates";
import type { StaffCertificateDto } from "@/features/certificates/types/certificate.types";
import { StaffCertificateDetailExpanded } from "@/features/certificates/components/StaffCertificateDetailExpanded";
import {
  CertificateStatusBadge,
  ExpiryBadge,
} from "@/features/certificates/components/CertificateStatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
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
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CheckCircle2, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import type { CertificateTypeDto } from "../types/certificateType.types";

// onEdit: mở form sửa chứng chỉ
// onCreate: mở form thêm chứng chỉ
interface Props {
  onEdit: (item: StaffCertificateDto) => void;
  onCreate: () => void;
  staffId?: number;
  submitMode?: boolean;
}

export function StaffCertificateTable({
  onEdit,
  onCreate,
  staffId,
  submitMode = false,
}: Props) {
  const perm = CERTIFICATE_PERM;

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffCertificateDto | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // Lấy danh sách loại chứng chỉ để filter
  const { data: typesResult } = useCertificateTypes({
    pageIndex: 1,
    pageSize: 500,
  });
  const types = typesResult?.data?.items ?? [];

  const queryParams = {
    pageIndex,
    pageSize,
    filter: filter || undefined,
    orderBy,
    isDescending,
    staffId,
    certificateTypeId: selectedCategoryId ?? undefined,
  };

  const { data: result, isLoading } = useStaffCertificates(queryParams);
  const deleteMutation = useDeleteStaffCertificate();
  const updateMutation = useUpdateStaffCertificate();

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

  // Lọc theo loại chứng chỉ
  function handleCategoryChange(value: string) {
    if (!value) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(Number(value));
    }
    setPageIndex(1);
    setExpandedId(null);
  }

  // Mở/đóng chi tiết một dòng
  function handleToggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
  }

  // Duyệt chứng chỉ
  function handleApprove(cert: StaffCertificateDto) {
    if (!cert.id) return;
    updateMutation.mutate({ id: cert.id, data: { status: 1 } });
  }

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (response) => {
        if (response.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  const emptyColSpan = 8;
  const addButtonLabel = submitMode ? "Nộp chứng chỉ" : "Thêm chứng chỉ";

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
              placeholder="Tìm theo tên chứng chỉ, tổ chức..."
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
              <option value="">Tất cả loại chứng chỉ</option>
              {types.map((type: CertificateTypeDto) => (
                <option key={type.id} value={type.id?.toString() || ""}>
                  {type.name}
                </option>
              ))}
            </Select>

            {submitMode ? (
              <Button
                variant="primary"
                size="sm"
                className="mb-0 mr-0 h-9"
                onClick={onCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                {addButtonLabel}
              </Button>
            ) : (
              <PermissionGate resource={perm.resource} action={perm.create}>
                <Button
                  variant="primary"
                  size="sm"
                  className="mb-0 mr-0 h-9"
                  onClick={onCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {addButtonLabel}
                </Button>
              </PermissionGate>
            )}
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
                    label="Nhân viên"
                    column="staffName"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Chứng chỉ"
                    column="certificateName"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Tổ chức cấp</TableHeaderCell>
                <TableHeaderCell>
                  <SortableColumnHeader
                    label="Ngày cấp"
                    column="issuedDate"
                    orderBy={orderBy}
                    isDescending={isDescending}
                    onSort={handleSort}
                    onPrimary
                  />
                </TableHeaderCell>
                <TableHeaderCell>Hết hạn</TableHeaderCell>
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
                    {submitMode
                      ? "Bạn chưa nộp chứng chỉ nào"
                      : "Chưa có chứng chỉ"}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <Fragment key={item.id}>
                    {/* Dòng data */}
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
                        {(safePage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-kit-heading">
                        {item.staffName ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-kit-heading">
                            {item.certificateName}
                          </p>
                          <p className="text-xs text-kit-muted">
                            {item.typeName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {item.issuingOrganization ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-kit-muted">
                          {formatDisplayDate(item.issuedDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ExpiryBadge
                          expiryDate={item.expiryDate ?? undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <CertificateStatusBadge status={item.status} />
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

                          {!submitMode && item.status === 0 ? (
                            <PermissionGate
                              resource={perm.resource}
                              action={perm.update}
                            >
                              <Tooltip text="Duyệt">
                                <Button
                                  size="icon-sm"
                                  variant="outline-success"
                                  className="mb-0 mr-0"
                                  loading={updateMutation.isPending}
                                  onClick={() => handleApprove(item)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                            </PermissionGate>
                          ) : null}

                          {!submitMode ? (
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
                          ) : null}

                          {!submitMode ? (
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
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Chi tiết chứng chỉ */}
                    {expandedId === item.id && item.id != null ? (
                      <TableRow className="relative z-10 border-x-2 border-b-2 border-t-0 border-kit-primary [&>td]:bg-kit-white!">
                        <TableCell
                          colSpan={emptyColSpan}
                          className="border-b-0 p-0"
                        >
                          <StaffCertificateDetailExpanded
                            cert={item}
                            onEdit={() => onEdit(item)}
                            onApprove={submitMode ? undefined : handleApprove}
                            isApproving={updateMutation.isPending}
                            submitMode={submitMode}
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

      {/* Dialog xóa */}
      {!submitMode ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
          title="Xóa chứng chỉ"
          description={`Bạn có chắc muốn xóa chứng chỉ "${deleteTarget?.certificateName ?? ""}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
