import type { AppointmentDto } from "@/features/booking/types/booking.types";
import { formatDisplayDate, toLocalTimeOnly } from "@/shared/utils/date.utils";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useInvalidatePendingOnline,
  usePendingOnlineAppointments,
} from "../hooks/usePendingOnlineAppointments";
import { cashierApi } from "../api/cashier.api";
import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import { toast } from "@/shared/components/kitToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { Button } from "@/shared/elements/Button";
import { Check, Pencil, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Pagination } from "@/shared/components/Pagination";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

type CashierBookingOnlineModalProps = {
  open: boolean;
  onClose: () => void;
  onEdit: (item: AppointmentDto) => void;
};

function formatAppointmentTime(item: AppointmentDto): string {
  const dateText = formatDisplayDate(item.appointmentDate);
  const startTime = toLocalTimeOnly(item.timeSlotStartTime);
  const endTime = toLocalTimeOnly(item.timeSlotEndTime);

  if (startTime && endTime) {
    return dateText + " " + startTime + " - " + endTime;
  }

  if (startTime) {
    return dateText + " " + startTime;
  }
  return dateText;
}
function joinServiceNames(serviceNames?: string[]): string {
  if (!serviceNames || serviceNames.length === 0) {
    return "—";
  }

  let result = "";
  for (let index = 0; index < serviceNames.length; index++) {
    if (index > 0) {
      result = result + ", ";
    }
    result = result + serviceNames[index];
  }
  return result;
}
export function CashierBookingOnlineModal({
  open,
  onClose,
  onEdit,
}: CashierBookingOnlineModalProps) {
  const { invalidatePendingOnline } = useInvalidatePendingOnline();
  const salonId = useAuthStore((state) => state.getEffectiveSalonId());
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);

  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  const query = usePendingOnlineAppointments(pageIndex, pageSize, open, salonId);
  const items = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const totalPages = Math.max(1, query.data?.totalPages ?? 1);

  async function refreshList() {
    await invalidatePendingOnline();
  }

  async function handleConfirm(item: AppointmentDto) {
    if (!item.id || busyId != null) return;
    setBusyId(item.id);
    try {
      const res = await cashierApi.updateBookingStatus(
        item.id,
        APPOINTMENT_STATUS.CONFIRMED,
      );
      if (!res.isSuccess) {
        toast.error(res.message || "Không thể xác nhận lịch hẹn");
        return;
      }
      toast.success(res.message || "Đã xác nhận lịch hẹn");
      await refreshList();
    } catch {
      toast.error("Không thể xác nhận lịch hẹn");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancelAppointment() {
    if (!cancelTarget?.id || busyId != null) return;
    setBusyId(cancelTarget.id);
    try {
      const res = await cashierApi.updateBookingStatus(
        cancelTarget.id,
        APPOINTMENT_STATUS.CANCELLED,
      );
      if (!res.isSuccess) {
        toast.error(res.message || "Không thể hủy lịch hẹn");
        return;
      }
      toast.success(res.message || "Đã hủy lịch hẹn");
      setCancelTarget(null);
      await refreshList();
    } catch {
      toast.error("Không thể hủy lịch hẹn");
    } finally {
      setBusyId(null);
    }
  }

  function handleEdit(item: AppointmentDto) {
    onClose();
    onEdit(item);
  }

  function renderRows() {
    if (query.isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-8 text-center text-kit-muted">
            Đang tải...
          </TableCell>
        </TableRow>
      );
    }

    if (query.isError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-8 text-center text-kit-danger">
            Không tải được danh sách lịch online
          </TableCell>
        </TableRow>
      );
    }

    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-8 text-center text-kit-muted">
            Không có lịch hẹn chờ xác nhận
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item) => {
      const isBusy = busyId === item.id;
      return (
        <TableRow key={item.id}>
          <TableCell className="font-medium">
            {item.appointmentCode || "#" + item.id}
          </TableCell>
          <TableCell>{formatAppointmentTime(item)}</TableCell>
          <TableCell>
            <div className="font-medium text-kit-primary">{item.customerName}</div>
            <div className="text-xs text-kit-muted">{item.customerPhone}</div>
          </TableCell>
          <TableCell>{joinServiceNames(item.serviceNames)}</TableCell>
          <TableCell className="text-kit-primary font-medium">
            {item.staffFullName || "—"}
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              <Button
                variant="success"
                size="sm"
                className="mb-0"
                disabled={isBusy}
                onClick={() => handleConfirm(item)}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                className="mb-0"
                disabled={isBusy}
                onClick={() => handleEdit(item)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="mb-0"
                disabled={isBusy}
                onClick={() => setCancelTarget(item)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={"Lịch hẹn chờ xác nhận(" + totalCount + ")"}
        size="xl"
      >
        <div className="space-y-3">
          <div className="overflow-x-auto rounded border border-kit">
            <Table hover striped>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-xs">Mã lịch</TableHeaderCell>
                  <TableHeaderCell className="text-xs">
                    Thời gian
                  </TableHeaderCell>
                  <TableHeaderCell className="text-xs">
                    Khách hàng
                  </TableHeaderCell>
                  <TableHeaderCell className="text-xs">Dịch vụ</TableHeaderCell>
                  <TableHeaderCell className="text-xs">
                    Kỹ thuật viên
                  </TableHeaderCell>
                  <TableHeaderCell className="text-xs">
                    Thao tác
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody className="text-xs">{renderRows()}</TableBody>
            </Table>
          </div>
          {totalPages > 1 ? (
            <div className="flex justify-center">
              <Pagination
                page={pageIndex}
                pageCount={totalPages}
                onPageChange={setPageIndex}
              />
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setCancelTarget(null);
        }}
        onConfirm={handleCancelAppointment}
        title="Xác nhận hủy lịch hẹn"
        description="Bạn có chắc chắn muốn hủy lịch hẹn này không?"
        confirmLabel="Hủy"
        cancelLabel="Đóng"
        variant="danger"
        loading={busyId != null}
      />
    </>
  );
}
