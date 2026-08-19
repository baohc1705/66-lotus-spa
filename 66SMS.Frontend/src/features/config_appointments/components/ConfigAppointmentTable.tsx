// Giải thích:
// onEdit: Hàm xử lý khi nhấn vào nút sửa

import type { ConfigAppointmentDTO } from "@/features/config_appointments/types/configAppointment.types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  useConfigAppointments,
  useDeleteConfigAppointment,
} from "../hooks/useConfigAppointments";
import { CONFIG_APPOINTMENT_PERM } from "../constants/config_appointment.permissions";

// onCreate: Hàm xử lý khi nhấn vào nút thêm
interface Props {
  onEdit: (item: ConfigAppointmentDTO) => void;
  onCreate: () => void;
}

export function ConfigAppointmentTable({ onEdit, onCreate }: Props) {
  const perm = CONFIG_APPOINTMENT_PERM;

  // Giải thích:
  // Phân trang
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ConfigAppointmentDTO | null>(
    null,
  );

  const queryParams = {
    pageIndex,
    pageSize,
    keyword: filter || undefined,
  };

  const query = useConfigAppointments(queryParams);

  const paged = query.data?.data;
  const configAppointments = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);

  // Giải thích:
  // safePage là trang hiện tại, nếu pageIndex lớn hơn totalPages thì sẽ đặt là totalPages
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  // Giải thích:
  // deleteMutation: Xóa một cấu hình lịch hẹn
  const deleteMutation = useDeleteConfigAppointment();

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
  // handlePageSizeChange: Hàm xử lý khi chọn số dòng mỗi trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
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
  // emptyColSpan: Số cột khi bảng trống
  const emptyColSpan = 6;

  return (
    <div className="space-y-0 pb-6">
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        {/* Toolbar của bảng */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-kit-muted" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm cấu hình lịch hẹn..."
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
                Thêm cấu hình lịch hẹn
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Bảng */}
        <TableResponsive>
          <Table hover striped>
            {/* Header của bảng */}
            <TableHead className="bg-kit-primary text-kit-white [&_th]:bg-kit-primary">
              <TableRow>
                <TableHeaderCell>Chi nhánh</TableHeaderCell>
                <TableHeaderCell>Phần trăm đặt cọc</TableHeaderCell>
                <TableHeaderCell>Thời gian bắt đầu</TableHeaderCell>
                <TableHeaderCell>Thời gian kết thúc</TableHeaderCell>
                <TableHeaderCell>Khoảng thời gian</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>

            {/* Body của bảng */}
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : configAppointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-kit-muted"
                    colSpan={emptyColSpan}
                  >
                    Chưa có cấu hình lịch hẹn
                  </TableCell>
                </TableRow>
              ) : (
                configAppointments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.salonName}</TableCell>
                    <TableCell>{item.depositPercent}</TableCell>
                    <TableCell>{toLocalTimeOnly(item.startTime)}</TableCell>
                    <TableCell>{toLocalTimeOnly(item.endTime)}</TableCell>
                    <TableCell>{item.slotMinutes} phút</TableCell>
                    <TableCell className="flex items-center gap-2">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableResponsive>

        {totalCount >= PAGE_SIZE_OPTIONS[0] ? (
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

        {/* Dialog xóa một dịch vụ */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
          title="Xóa cấu hình lịch hẹn"
          description={`Bạn có chắc muốn xóa cấu hình lịch hẹn của chi nhánh "${deleteTarget?.salonName}"?`}
          confirmLabel="Xóa"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      </div>
    </div>
  );
}
