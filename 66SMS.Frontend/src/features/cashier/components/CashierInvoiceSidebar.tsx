import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_DOT_CLASS,
  APPOINTMENT_STATUS_LABELS,
} from "@/features/booking/constants/appointment.constants";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { FormField } from "@/shared/components/forms/FormField";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { cn } from "@/lib/utils";
import { cashierApi } from "../api/cashier.api";
import type { BookingStatus, CashierBooking, CashierPosition } from "../types";

interface CashierInvoiceSidebarProps {
  booking: CashierBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignPosition?: (bookingId: string, positionId: number) => Promise<void>;
  onStatusUpdated?: () => void;
  onPayInvoice?: (booking: CashierBooking) => void;
  isPaying?: boolean;
  salonId?: number | null;
}

type StatusOption = {
  value: number;
  label: string;
  color: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.WAITING,
  APPOINTMENT_STATUS.IN_SERVICE,
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.NO_SHOW,
].map((value) => ({
  value,
  label: APPOINTMENT_STATUS_LABELS[value],
  color: APPOINTMENT_STATUS_DOT_CLASS[value],
}));

function toBackendStatus(status: BookingStatus): number {
  switch (status) {
    case "pending":
      return APPOINTMENT_STATUS.PENDING;
    case "confirmed":
      return APPOINTMENT_STATUS.CONFIRMED;
    case "not-arrived":
    case "waiting":
      return APPOINTMENT_STATUS.WAITING;
    case "in-progress":
      return APPOINTMENT_STATUS.IN_SERVICE;
    case "completed":
    case "unpaid":
    case "paid":
      return APPOINTMENT_STATUS.COMPLETED;
    case "cancelled":
      return APPOINTMENT_STATUS.CANCELLED;
    default:
      return APPOINTMENT_STATUS.PENDING;
  }
}

function formatDateLabel(date?: string) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}

function calcDurationMins(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
  return eh * 60 + em - (sh * 60 + sm);
}

function money(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function CashierInvoiceSidebar({
  booking,
  isOpen,
  onClose,
  onAssignPosition,
  onStatusUpdated,
  onPayInvoice,
  isPaying = false,
  salonId,
}: CashierInvoiceSidebarProps) {
  if (!isOpen || !booking) return null;

  return (
    <CashierInvoiceSidebarForm
      key={booking.id}
      booking={booking}
      onClose={onClose}
      onAssignPosition={onAssignPosition}
      onStatusUpdated={onStatusUpdated}
      onPayInvoice={onPayInvoice}
      isPaying={isPaying}
      salonId={salonId}
    />
  );
}

type FormProps = Omit<CashierInvoiceSidebarProps, "isOpen" | "booking"> & {
  booking: CashierBooking;
};

function CashierInvoiceSidebarForm({
  booking,
  onClose,
  onAssignPosition,
  onStatusUpdated,
  onPayInvoice,
  isPaying = false,
  salonId,
}: FormProps) {
  const [selectedStatus, setSelectedStatus] = useState(() =>
    toBackendStatus(booking.status),
  );
  const [note, setNote] = useState(() => booking.note ?? "");
  const [positions, setPositions] = useState<CashierPosition[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    null,
  );
  const [loadingPositions, setLoadingPositions] = useState(
    () => booking.status === "not-arrived",
  );
  const [isSaving, setIsSaving] = useState(false);

  const currentBackendStatus = toBackendStatus(booking.status);
  const needsPosition = booking.status === "not-arrived";

  useEffect(() => {
    if (!needsPosition) return;

    let cancelled = false;
    cashierApi
      .getPositions(salonId, booking.bookingDate)
      .then((res) => {
        if (cancelled) return;
        setPositions(res.isSuccess && res.data ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setPositions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPositions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [needsPosition, booking.bookingDate, salonId]);

  const durationMins = useMemo(
    () => calcDurationMins(booking.startTime, booking.endTime),
    [booking.startTime, booking.endTime],
  );

  const code = booking.appointmentCode || booking.id;
  const isCompleted = currentBackendStatus === APPOINTMENT_STATUS.COMPLETED;
  const canPayInvoice =
    !!onPayInvoice &&
    booking.remainingAmount > 0 &&
    (booking.status === "unpaid" || booking.status === "completed");

  const handleSave = async () => {
    if (isSaving) return;

    const statusChanged = selectedStatus !== currentBackendStatus;
    const noteChanged = (note.trim() || "") !== (booking.note?.trim() || "");
    const willAssign =
      needsPosition && !!selectedPositionId && !!onAssignPosition;

    if (!statusChanged && !willAssign && !noteChanged) {
      toast.info("Không có thay đổi để lưu");
      return;
    }

    if (noteChanged && !statusChanged && !willAssign) {
      toast.info("Ghi chú được lưu kèm khi cập nhật trạng thái");
      return;
    }

    setIsSaving(true);
    try {
      if (willAssign && selectedPositionId) {
        await onAssignPosition!(booking.id, selectedPositionId);
      }

      if (statusChanged) {
        const res = await cashierApi.updateBookingStatus(
          booking.id,
          selectedStatus,
          note.trim() || undefined,
        );
        if (!res.isSuccess) {
          toast.error(res.message || "Không thể cập nhật trạng thái");
          return;
        }
        toast.success(res.message || "Đã cập nhật trạng thái");
      }

      await onStatusUpdated?.();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error as AxiosError<Result<unknown>>,
          "Không thể lưu lịch hẹn",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-adminGray-50 rounded-[5px] border border-adminGold-600/30 shadow-[0_12px_40px_rgba(42,31,26,0.22)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-adminGold-600/20 bg-white/70 shrink-0">
          <h2 className="font-semibold text-adminInk">
            Lịch hẹn
            <span className="ml-2 font-normal text-adminGray-600">
              (Mã: {code})
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[5px] hover:bg-adminGray-50 text-adminGray-600 hover:text-adminInk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-[5px] border border-adminGold-600/20 bg-white">
                <div className="w-14 h-14 rounded-full bg-adminGold-600/15 flex items-center justify-center text-adminGold-600 font-bold text-xl shrink-0">
                  {booking.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-adminInk font-semibold">
                    <User className="w-4 h-4 text-adminGray-600 shrink-0" />
                    <span className="truncate">{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-adminGray-600">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{booking.customerPhone || "—"}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-adminGray-600 shrink-0">
                  <div>Mã: {code}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-[5px] border border-adminGold-600/20 bg-white">
                <FormField label="Ngày hẹn">
                  <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                    {formatDateLabel(booking.bookingDate)}
                  </div>
                </FormField>
                <FormField label="Giờ hẹn">
                  <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                    {booking.startTime} – {booking.endTime}
                  </div>
                </FormField>
                <FormField label="Thời lượng">
                  <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                    {durationMins != null ? `${durationMins} phút` : "—"}
                  </div>
                </FormField>
              </div>

              <div className="rounded-[5px] border border-adminGold-600/20 bg-white overflow-hidden">
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 px-4 py-2.5 bg-adminGray-50/80 border-b border-adminGold-600/15 text-xs font-semibold text-adminGray-600 uppercase tracking-wide">
                  <span>Dịch vụ</span>
                  <span>Nhân viên</span>
                  <span>Phòng / Chỗ ngồi</span>
                </div>
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-adminInk items-start">
                  <span className="font-medium">{booking.serviceName}</span>
                  <span>{booking.staffName}</span>
                  <div>
                    {needsPosition ? (
                      loadingPositions ? (
                        <span className="inline-flex items-center gap-1.5 text-adminGray-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang tải...
                        </span>
                      ) : (
                        <select
                          value={selectedPositionId ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedPositionId(value ? Number(value) : null);
                          }}
                          className="w-full text-sm border border-adminGold-600/20 bg-white rounded-[5px] px-2.5 py-2 focus:outline-none focus:border-adminGreen-600"
                        >
                          <option value="">Chọn vị trí...</option>
                          {positions.map((pos: CashierPosition) => (
                            <option
                              key={pos.id}
                              value={pos.id}
                              disabled={!pos.isSelectable}
                            >
                              {pos.roomName} — {pos.name} — {pos.statusLabel}
                            </option>
                          ))}
                        </select>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-adminGold-600" />
                        {booking.positionName || "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[5px] border border-adminGold-600/20 bg-white text-sm">
                <div>
                  <div className="text-xs text-adminGray-600 mb-1">
                    Tổng tiền
                  </div>
                  <div className="font-semibold text-adminInk">
                    {money(booking.totalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-adminGray-600 mb-1">Đã thu</div>
                  <div className="font-semibold text-adminGreen-600">
                    {money(booking.paidAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-adminGray-600 mb-1">Còn lại</div>
                  <div className="font-semibold text-adminInk">
                    {money(booking.remainingAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-adminGray-600 mb-1">Cọc</div>
                  <div className="font-semibold text-adminInk">
                    {booking.depositPaid
                      ? money(
                          Math.min(booking.paidAmount, booking.depositAmount),
                        )
                      : "Chưa cọc"}
                  </div>
                </div>
              </div>

              <FormField label="Ghi chú">
                <AdminTextarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú lịch hẹn"
                  rows={3}
                />
              </FormField>
            </div>

            <div className="rounded-[5px] border border-adminGold-600/20 bg-white p-4 h-fit">
              <div className="text-sm font-semibold text-adminInk mb-3">
                Trạng thái
              </div>
              <div className="space-y-1.5">
                {STATUS_OPTIONS.map((opt: StatusOption) => {
                  const checked = selectedStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedStatus(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[5px] text-left text-sm transition-colors",
                        checked
                          ? "bg-adminGold-600/10 text-adminInk font-medium"
                          : "hover:bg-adminGray-50 text-adminGray-600",
                      )}
                    >
                      <span
                        className={cn(
                          "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                          checked
                            ? "border-adminGreen-600"
                            : "border-adminGray-300",
                        )}
                      >
                        {checked && (
                          <span className="w-1.5 h-1.5 rounded-full bg-adminGreen-600" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          opt.color,
                        )}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-adminGold-600/20 bg-white/80 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[5px] border border-adminGold-600/30 text-sm font-medium text-adminInk hover:bg-adminGray-50"
          >
            Đóng
          </button>
          {canPayInvoice && (
            <button
              type="button"
              onClick={() => onPayInvoice?.(booking)}
              disabled={isPaying || isSaving}
              className={cn(
                "h-10 px-4 rounded-[5px] text-sm font-semibold text-white inline-flex items-center gap-2",
                isPaying || isSaving
                  ? "bg-adminGray-400 cursor-not-allowed"
                  : "bg-adminInk hover:bg-adminInk/90",
              )}
            >
              {isPaying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Thanh toán
            </button>
          )}
          {!isCompleted && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isPaying}
              className={cn(
                "h-10 px-4 rounded-[5px] text-sm font-semibold text-white inline-flex items-center gap-2",
                isSaving || isPaying
                  ? "bg-adminGray-400 cursor-not-allowed"
                  : "bg-adminGreen-600 hover:bg-adminGreen-600/90",
              )}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Lưu thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
