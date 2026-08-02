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
import { useTechnicians } from "@/features/booking/hooks/useBookingData";
import type { TechnicianDTO } from "@/features/booking/types/booking.types";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { FormField } from "@/shared/components/forms/FormField";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { cn } from "@/lib/utils";
import { cashierApi } from "../api/cashier.api";
import type { BookingStatus, CashierBooking, CashierPosition } from "../types";
import { FallbackImage } from "@/shared/components/FallbackImage";

interface CashierInvoiceSidebarProps {
  booking: CashierBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignPosition?: (bookingId: string, positionId: number) => Promise<void>;
  onAssignStaff?: (bookingId: string, staffId: number) => Promise<void>;
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
  onAssignStaff,
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
      onAssignStaff={onAssignStaff}
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
  onAssignStaff,
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
    () => booking.positionId ?? null,
  );
  const [selectedStaffId, setSelectedStaffId] = useState(
    () => String(booking.staffId ?? ""),
  );
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentBackendStatus = toBackendStatus(booking.status);
  const canEditAssignment =
    booking.status === "not-arrived" || booking.status === "waiting";

  const techniciansQuery = useTechnicians(
    canEditAssignment ? (booking.bookingDate ?? null) : null,
    booking.serviceId ?? undefined,
    salonId ?? undefined,
  );

  useEffect(() => {
    if (!canEditAssignment) return;

    let cancelled = false;
    setLoadingPositions(true);
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
  }, [canEditAssignment, booking.bookingDate, salonId]);

  const staffOptions = useMemo(() => {
    const options: { value: string; label: string; disabled?: boolean }[] = [];
    const seen = new Set<string>();

    const currentId = String(booking.staffId ?? "");
    if (currentId) {
      options.push({
        value: currentId,
        label: booking.staffName || `NV #${currentId}`,
      });
      seen.add(currentId);
    }

    const techs = techniciansQuery.data ?? [];
    techs.forEach((tech: TechnicianDTO) => {
      if (tech.isAny || tech.id == null) return;
      const value = String(tech.id);
      if (seen.has(value)) return;
      seen.add(value);
      const slotsLeft = tech.slotsLeft ?? 0;
      options.push({
        value,
        label: `${tech.name || "KTV"}${slotsLeft > 0 ? ` · còn ${slotsLeft} slot` : " · hết slot"}`,
        disabled: slotsLeft <= 0,
      });
    });

    return options;
  }, [booking.staffId, booking.staffName, techniciansQuery.data]);

  const positionOptions = useMemo(() => {
    return positions.map((pos: CashierPosition) => {
      const isCurrent = pos.id === booking.positionId;
      return {
        value: String(pos.id),
        label: `${pos.roomName} — ${pos.name} — ${pos.statusLabel}`,
        disabled: !pos.isSelectable && !isCurrent,
      };
    });
  }, [positions, booking.positionId]);

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
    const staffChanged =
      canEditAssignment &&
      !!onAssignStaff &&
      !!selectedStaffId &&
      selectedStaffId !== String(booking.staffId ?? "");
    const positionChanged =
      canEditAssignment &&
      !!onAssignPosition &&
      selectedPositionId != null &&
      selectedPositionId !== (booking.positionId ?? null);

    if (!statusChanged && !staffChanged && !positionChanged && !noteChanged) {
      toast.info("Không có thay đổi để lưu");
      return;
    }

    if (noteChanged && !statusChanged && !staffChanged && !positionChanged) {
      toast.info("Ghi chú được lưu kèm khi cập nhật trạng thái");
      return;
    }

    setIsSaving(true);
    try {
      if (staffChanged) {
        await onAssignStaff!(booking.id, Number(selectedStaffId));
      }

      if (positionChanged && selectedPositionId != null) {
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
      } else if (staffChanged || positionChanged) {
        toast.success("Đã lưu thông tin lịch hẹn");
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
                <div className="w-14 h-14 rounded-full bg-adminGold-600/15 flex items-center justify-center shrink-0 overflow-hidden">
                  <FallbackImage
                    kind="customer"
                    src={booking.customerAvatar}
                    alt={booking.customerName}
                    className="w-14 h-14 object-cover"
                  />
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

                  <div>
                    {canEditAssignment ? (
                      techniciansQuery.isLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-adminGray-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang tải...
                        </span>
                      ) : (
                        <SearchableSelect
                          value={selectedStaffId}
                          onValueChange={setSelectedStaffId}
                          options={staffOptions}
                          placeholder="Chọn nhân viên"
                          searchPlaceholder="Tìm nhân viên..."
                          className="h-9 w-full"
                        />
                      )
                    ) : (
                      <span>{booking.staffName}</span>
                    )}
                  </div>

                  <div>
                    {canEditAssignment ? (
                      loadingPositions ? (
                        <span className="inline-flex items-center gap-1.5 text-adminGray-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Đang tải...
                        </span>
                      ) : (
                        <SearchableSelect
                          value={
                            selectedPositionId != null
                              ? String(selectedPositionId)
                              : ""
                          }
                          onValueChange={(v) =>
                            setSelectedPositionId(v ? Number(v) : null)
                          }
                          options={positionOptions}
                          placeholder="Chọn vị trí..."
                          searchPlaceholder="Tìm phòng / vị trí..."
                          className="h-9 w-full"
                        />
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
