import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { Tooltip } from "@/shared/components/Tooltip";
import { Button } from "@/shared/elements/Button";
import { Select } from "@/shared/forms/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { EMPTY_CELL } from "@/shared/constants/display.const";
import {
  formatDateTimeDisplay,
  formatDisplayDate,
} from "@/shared/utils/date.utils";

import { StaffSalonFormDialog } from "../components/StaffSalonFormDialog";
import { StaffSalonStatusBadge } from "../components/StaffSalonStatusBadge";
import { useDeleteStaffSalon, useStaffSalons } from "../hooks/useStaffSalons";
import type { StaffSalonDTO } from "../types/staff-salon.types";

interface SalonStaffPageProps {
  salonId: number;
}

export function SalonStaffPage({ salonId }: SalonStaffPageProps) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffSalonDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffSalonDTO | null>(null);

  const { data: result, isLoading } = useStaffSalons({
    salonId,
    pageIndex,
    pageSize,
  });
  const deleteMutation = useDeleteStaffSalon();

  const paged = result?.data;
  const items = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (response) => {
        if (response.isSuccess) setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-3 font-sans text-sm text-kit-body">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-kit-heading">
          <Users className="h-4 w-4 text-kit-primary" />
          <span className="text-sm font-semibold">Nhân viên chi nhánh</span>
          <span className="text-xs text-kit-muted">({totalCount})</span>
        </div>
        <Button
          variant="admin"
          size="sm"
          className="mb-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Gán nhân viên
        </Button>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-kit-muted">Đang tải...</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-kit-muted">
          <Users className="h-8 w-8" />
          <p className="text-sm font-medium text-kit-heading">
            Chưa có nhân viên
          </p>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Gán nhân viên
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-kit bg-kit-white">
            <Table size="sm" hover striped>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>#</TableHeaderCell>
                  <TableHeaderCell>Mã nhân viên</TableHeaderCell>
                  <TableHeaderCell>Họ tên</TableHeaderCell>
                  <TableHeaderCell>Vai trò</TableHeaderCell>
                  <TableHeaderCell>Ngày bắt đầu</TableHeaderCell>
                  <TableHeaderCell>Ngày nghỉ</TableHeaderCell>
                  <TableHeaderCell>Trạng thái</TableHeaderCell>
                  <TableHeaderCell>Ngày tạo</TableHeaderCell>
                  <TableHeaderCell>Cập nhật</TableHeaderCell>
                  <TableHeaderCell>Thao tác</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item: StaffSalonDTO, index: number) => (
                  <TableRow key={item.id ?? `${item.staffId}-${index}`}>
                    <TableCell className="text-kit-muted">
                      {(safePage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-kit-heading">
                      {item.staffCode ?? EMPTY_CELL}
                    </TableCell>
                    <TableCell className="font-medium text-kit-heading">
                      {item.staffName ?? EMPTY_CELL}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.staffRole ?? EMPTY_CELL}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {formatDisplayDate(item.startDate) || EMPTY_CELL}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.endDate
                        ? formatDisplayDate(item.endDate)
                        : EMPTY_CELL}
                    </TableCell>
                    <TableCell>
                      <StaffSalonStatusBadge
                        status={item.status}
                        isManager={item.isManager}
                      />
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {formatDateTimeDisplay(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-kit-muted">
                      {item.updatedAt
                        ? formatDateTimeDisplay(item.updatedAt)
                        : EMPTY_CELL}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-kit-muted">
                <span>
                  {rangeStart}-{rangeEnd} / {totalCount}
                </span>
                <Select
                  value={String(pageSize)}
                  onChange={(event) =>
                    handlePageSizeChange(Number(event.target.value))
                  }
                  options={[
                    { value: "5", label: "5 / trang" },
                    { value: "10", label: "10 / trang" },
                    { value: "20", label: "20 / trang" },
                  ]}
                  inputSize="sm"
                  className="w-auto min-w-28"
                />
              </div>
              <Pagination
                page={safePage}
                pageCount={totalPages}
                onPageChange={setPageIndex}
                size="sm"
              />
            </div>
          ) : null}
        </>
      )}

      <StaffSalonFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        salonId={salonId}
      />

      {editTarget ? (
        <StaffSalonFormDialog
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          salonId={salonId}
          staffSalon={editTarget}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title="Xóa nhân viên khỏi chi nhánh?"
          description="Hành động này sẽ xóa nhân viên khỏi chi nhánh này."
          onConfirm={handleDelete}
          confirmLabel="Xóa"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      ) : null}
    </div>
  );
}
