import { useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Pagination } from "@/shared/components/Pagination";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
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
import { EMPTY_CELL } from "@/shared/constants/display.const";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { Select } from "@/shared/forms/Select";
import {
  formatDateTimeDisplay,
  formatDisplayDate,
} from "@/shared/utils/date.utils";
import {
  useDeleteStaffSalon,
  useStaffSalons,
} from "@/features/salons/hooks/useStaffSalons";
import type { StaffSalonDTO } from "@/features/salons/types/staffSalon.types";
import { STAFF_PERM } from "@/features/staffs/constants/staff.permissions";
import { StaffSalonForm } from "./StaffSalonForm";
import { Badge } from "@/shared/elements/Badge";

interface Props {
  salonId: number;
}
interface StaffSalonStatusBadgeProps {
  status?: number;
  isManager?: boolean;
}
function StaffSalonStatusBadge({ status }: StaffSalonStatusBadgeProps) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Đang làm việc
      </Badge>
    );
  }
  if (status === 0) {
    return (
      <Badge variant="danger" soft>
        Đã nghỉ
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      —
    </Badge>
  );
}
export function StaffSalonTable({ salonId }: Props) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffSalonDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffSalonDTO | null>(null);

  const {
    data: result,
    isLoading,
    isFetching,
  } = useStaffSalons({
    salonId,
    pageIndex,
    pageSize,
  });

  const paged = result?.data;
  const items = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const deleteMutation = useDeleteStaffSalon();

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (response) => {
        if (response.isSuccess) setDeleteTarget(null);
      },
    });
  }

  const emptyColSpan = 9;

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <div className="rounded-md border border-kit bg-kit-white shadow-kit-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kit px-3 py-3">
          <div className="flex items-center gap-2 text-kit-heading">
            <Users className="h-4 w-4 text-kit-primary" />
            <span className="text-sm font-semibold">Nhân viên chi nhánh</span>
            <span className="text-xs text-kit-muted">({totalCount})</span>
          </div>
          <PermissionGate
            resource={STAFF_PERM.resource}
            action={STAFF_PERM.create}
            role={STAFF_PERM.role}
          >
            <Button
              variant="admin"
              size="sm"
              className="mb-0 mr-0 h-9"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Gán nhân viên
            </Button>
          </PermissionGate>
        </div>

        <TableResponsive>
          <Table hover striped>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-14">#</TableHeaderCell>
                <TableHeaderCell>Mã nhân viên</TableHeaderCell>
                <TableHeaderCell>Họ tên</TableHeaderCell>
                <TableHeaderCell>Vai trò</TableHeaderCell>
                <TableHeaderCell>Ngày bắt đầu</TableHeaderCell>
                <TableHeaderCell>Ngày nghỉ</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Cập nhật</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading || isFetching ? (
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
                    Chưa có nhân viên
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow
                    key={item.id ?? `${item.staffId}-${index}`}
                    className="cursor-pointer"
                  >
                    <TableCell className="text-kit-muted">
                      {rangeStart + index}
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
                      {item.updatedAt
                        ? formatDateTimeDisplay(item.updatedAt)
                        : EMPTY_CELL}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PermissionGate
                          resource={STAFF_PERM.resource}
                          action={STAFF_PERM.update}
                          role={STAFF_PERM.role}
                        >
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
                          resource={STAFF_PERM.resource}
                          action={STAFF_PERM.delete}
                          role={STAFF_PERM.role}
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
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPageIndex(1);
                }}
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

      <StaffSalonForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        salonId={salonId}
      />

      {editTarget ? (
        <StaffSalonForm
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          salonId={salonId}
          staffSalon={editTarget}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Xóa nhân viên khỏi chi nhánh?"
        description={`Hành động này sẽ xóa nhân viên khỏi chi nhánh này.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
