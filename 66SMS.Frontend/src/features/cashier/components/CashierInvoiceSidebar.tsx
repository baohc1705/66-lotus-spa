import { useMemo, useState } from "react";
import { Check, CreditCard, Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "@/shared/components/kitToast";
import type { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import { Modal } from "@/shared/components/Modal";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { Button } from "@/shared/elements/Button";
import {
  ListGroup,
  ListGroupItem,
  type ListGroupTone,
} from "@/shared/elements/ListGroup";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Textarea } from "@/shared/forms/Textarea";
import type { Result } from "@/shared/types/common.types";
import { formatCurrency } from "@/shared/utils/currency";
import {
  formatDate,
  formatDateTimeDisplay,
  formatDisplayDate,
} from "@/shared/utils/date.utils";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useTimeSlots } from "@/features/booking/hooks/useBookingData";
import type { TimeSlotDTO } from "@/features/booking/types/booking.types";
import { filterSlotsAfterNow } from "@/features/booking/utils/timeSlot.utils";
import { cashierApi } from "../api/cashier.api";
import { useStaffAvailability } from "../hooks/useStaffAvailability";
import type {
  BookingStatus,
  CashierBooking,
  StaffAvailabilityDto,
} from "../types";

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
  tone: ListGroupTone;
  dotClass: string;
};

// Mapping mau / nhan giong filter calendar.
const STATUS_OPTIONS: StatusOption[] = [
  {
    value: APPOINTMENT_STATUS.PENDING,
    label: "Chưa xác nhận",
    tone: "secondary",
    dotClass: "bg-kit-secondary",
  },
  {
    value: APPOINTMENT_STATUS.CONFIRMED,
    label: "Đã xác nhận",
    tone: "info",
    dotClass: "bg-kit-info",
  },
  {
    value: APPOINTMENT_STATUS.WAITING,
    label: "Chờ phục vụ",
    tone: "warning",
    dotClass: "bg-kit-warning",
  },
  {
    value: APPOINTMENT_STATUS.IN_SERVICE,
    label: "Đang phục vụ",
    tone: "alternate",
    dotClass: "bg-kit-alt",
  },
  {
    value: APPOINTMENT_STATUS.COMPLETED,
    label: "Đã phục vụ",
    tone: "success",
    dotClass: "bg-kit-success",
  },
  {
    value: APPOINTMENT_STATUS.CANCELLED,
    label: "Đã hủy",
    tone: "danger",
    dotClass: "bg-kit-danger",
  },
];

function toBackendStatus(status: BookingStatus): number {
  if (status === "pending") return APPOINTMENT_STATUS.PENDING;
  if (status === "confirmed") return APPOINTMENT_STATUS.CONFIRMED;
  if (status === "not-arrived" || status === "waiting") {
    return APPOINTMENT_STATUS.WAITING;
  }
  if (status === "in-progress") return APPOINTMENT_STATUS.IN_SERVICE;
  if (status === "completed" || status === "unpaid" || status === "paid") {
    return APPOINTMENT_STATUS.COMPLETED;
  }
  if (status === "cancelled") return APPOINTMENT_STATUS.CANCELLED;
  return APPOINTMENT_STATUS.PENDING;
}

function isStatusOptionDisabled(
  currentStatus: number,
  optionValue: number,
): boolean {
  const flow = [
    APPOINTMENT_STATUS.PENDING,
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.WAITING,
    APPOINTMENT_STATUS.IN_SERVICE,
    APPOINTMENT_STATUS.COMPLETED,
  ];

  if (optionValue === APPOINTMENT_STATUS.CANCELLED) {
    return currentStatus === APPOINTMENT_STATUS.COMPLETED;
  }

  if (currentStatus === APPOINTMENT_STATUS.CANCELLED) {
    return optionValue !== APPOINTMENT_STATUS.CANCELLED;
  }

  let currentIndex = -1;
  let optionIndex = -1;
  for (let index = 0; index < flow.length; index++) {
    if (flow[index] === currentStatus) currentIndex = index;
    if (flow[index] === optionValue) optionIndex = index;
  }

  if (currentIndex < 0 || optionIndex < 0) {
    return false;
  }

  // Disable cac trang thai dung truoc trang thai hien tai.
  if (optionIndex < currentIndex) {
    return true;
  }

  return false;
}

function calcDurationMins(startTime: string, endTime: string) {
  const startParts = startTime.split(":");
  const endParts = endTime.split(":");
  const startHour = Number(startParts[0]);
  const startMin = Number(startParts[1]);
  const endHour = Number(endParts[0]);
  const endMin = Number(endParts[1]);
  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMin) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMin)
  ) {
    return null;
  }
  return endHour * 60 + endMin - (startHour * 60 + startMin);
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
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    () => booking.positionId ?? null,
  );
  const [selectedStaffId, setSelectedStaffId] = useState(() =>
    String(booking.staffId ?? ""),
  );
  const [editDate, setEditDate] = useState(() => booking.bookingDate || "");
  const [editSlotId, setEditSlotId] = useState<number | null>(
    () => booking.slotId ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const currentBackendStatus = toBackendStatus(booking.status);
  const canEditAssignment =
    booking.status === "not-arrived" || booking.status === "waiting";
  const canReschedule =
    booking.status === "pending" ||
    booking.status === "confirmed" ||
    booking.status === "waiting" ||
    booking.status === "not-arrived";

  const bookingDateObj = useMemo(() => {
    const source = editDate || booking.bookingDate;
    if (!source) return new Date();
    const parts = source.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    return new Date(year, month - 1, day);
  }, [editDate, booking.bookingDate]);

  const staffIdForSlots = Number(booking.staffId);
  const rescheduleSlotsQuery = useTimeSlots({
    date: canReschedule ? editDate || undefined : undefined,
    serviceId: canReschedule ? (booking.serviceId ?? undefined) : undefined,
    staffId:
      canReschedule && !Number.isNaN(staffIdForSlots) && staffIdForSlots > 0
        ? staffIdForSlots
        : undefined,
    salonId: salonId ?? undefined,
  });

  const rescheduleSlots = useMemo(() => {
    const raw = rescheduleSlotsQuery.data ?? [];
    return filterSlotsAfterNow(raw, editDate);
  }, [rescheduleSlotsQuery.data, editDate]);

  const timeSlotsQuery = useTimeSlots({
    date:
      canEditAssignment && !booking.slotId
        ? (booking.bookingDate ?? undefined)
        : undefined,
    serviceId: booking.serviceId ?? undefined,
    salonId: salonId ?? undefined,
  });

  const resolvedSlotId = useMemo(() => {
    if (editSlotId) return editSlotId;
    if (booking.slotId) return booking.slotId;
    const slots = timeSlotsQuery.data ?? [];
    for (let index = 0; index < slots.length; index++) {
      const slot = slots[index];
      if (
        slot.time === booking.startTime ||
        slot.time.startsWith(booking.startTime)
      ) {
        return slot.slotId;
      }
    }
    return null;
  }, [
    editSlotId,
    booking.slotId,
    booking.startTime,
    timeSlotsQuery.data,
  ]);

  const availabilityQuery = useStaffAvailability(
    canEditAssignment,
    bookingDateObj,
    resolvedSlotId,
    booking.serviceId ?? null,
    salonId,
  );

  const positionsQuery = useQuery({
    queryKey: ["cashier-positions", salonId, editDate || booking.bookingDate],
    queryFn: async () => {
      const res = await cashierApi.getPositions(
        salonId,
        editDate || booking.bookingDate,
      );
      return res.data ?? [];
    },
    enabled: canEditAssignment && !!(editDate || booking.bookingDate),
  });
  const loadingPositions = positionsQuery.isLoading;

  const staffOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const seen = new Set<string>();

    const currentId = String(booking.staffId ?? "");
    if (currentId) {
      options.push({
        value: currentId,
        label: booking.staffName || "NV #" + currentId,
      });
      seen.add(currentId);
    }

    const rows = availabilityQuery.data?.data ?? [];
    for (let index = 0; index < rows.length; index++) {
      const row: StaffAvailabilityDto = rows[index];
      if (row.status !== "available") continue;
      const value = String(row.staffId);
      if (seen.has(value)) continue;
      seen.add(value);
      options.push({
        value: value,
        label: row.staffName,
      });
    }

    return options;
  }, [booking.staffId, booking.staffName, availabilityQuery.data?.data]);

  const positionOptions = useMemo(() => {
    const list = positionsQuery.data ?? [];
    const options: { value: string; label: string }[] = [];
    for (let index = 0; index < list.length; index++) {
      const pos = list[index];
      if (!pos.isSelectable && pos.id !== booking.positionId) continue;
      options.push({
        value: String(pos.id),
        label: pos.roomName + " — " + pos.name + " — " + pos.statusLabel,
      });
    }
    return options;
  }, [positionsQuery.data, booking.positionId]);

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

    if (isStatusOptionDisabled(currentBackendStatus, selectedStatus)) {
      toast.error("Trạng thái này không được chọn với lịch hiện tại");
      return;
    }

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

    const dateChanged = canReschedule && editDate !== (booking.bookingDate || "");
    const slotChanged =
      canReschedule &&
      editSlotId != null &&
      editSlotId !== (booking.slotId ?? null);
    const scheduleChanged = dateChanged || slotChanged;

    if (scheduleChanged && !editDate) {
      toast.error("Vui lòng chọn ngày hẹn");
      return;
    }
    if (scheduleChanged && !editSlotId) {
      toast.error("Vui lòng chọn khung giờ mới");
      return;
    }

    if (
      !statusChanged &&
      !staffChanged &&
      !positionChanged &&
      !noteChanged &&
      !scheduleChanged
    ) {
      toast.info("Không có thay đổi để lưu");
      return;
    }

    if (
      noteChanged &&
      !statusChanged &&
      !staffChanged &&
      !positionChanged &&
      !scheduleChanged
    ) {
      toast.info("Ghi chú được lưu kèm khi cập nhật trạng thái");
      return;
    }

    setIsSaving(true);
    try {
      if (scheduleChanged && editSlotId != null) {
        const rescheduleRes = await cashierApi.rescheduleAppointment(
          booking.id,
          {
            appointmentDate: editDate,
            slotId: editSlotId,
          },
        );
        if (!rescheduleRes.isSuccess) {
          toast.error(
            rescheduleRes.message ||
              "Khung giờ mới không trống. Vui lòng chọn lại.",
          );
          return;
        }
        toast.success(rescheduleRes.message || "Đã đổi ngày/giờ lịch hẹn");
      }

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

  function isSlotSelectable(slot: TimeSlotDTO): boolean {
    const status = (slot.status || "").toLowerCase();
    if (status === "available" || status === "trống") return true;
    // Slot hien tai cua lich (cung ngay) van cho chon.
    if (
      editDate === (booking.bookingDate || "") &&
      (slot.slotId === booking.slotId || slot.time === booking.startTime)
    ) {
      return true;
    }
    return false;
  }

  function renderRescheduleSlots() {
    if (!canReschedule) return null;

    if (!editDate || !booking.serviceId) {
      return (
        <p className="rounded border border-dashed border-kit py-3 text-center text-xs text-kit-muted">
          Chọn ngày để xem khung giờ trống
        </p>
      );
    }

    if (rescheduleSlotsQuery.isLoading) {
      return (
        <p className="py-3 text-center text-xs text-kit-muted">
          Đang tải khung giờ...
        </p>
      );
    }

    if (rescheduleSlots.length === 0) {
      return (
        <p className="rounded border border-kit bg-kit-page py-3 text-center text-xs text-kit-muted">
          Không có khung giờ trong ngày này
        </p>
      );
    }

    const list = [];
    for (let index = 0; index < rescheduleSlots.length; index++) {
      const slot = rescheduleSlots[index];
      const selected = editSlotId === slot.slotId;
      const available = isSlotSelectable(slot);

      let classes =
        "border-kit bg-kit-page text-kit-muted cursor-not-allowed opacity-60";
      let label = "Không trống";

      if (available) {
        label = "Trống";
        if (selected) {
          classes = "border-kit-success bg-kit-success text-kit-white";
        } else {
          classes =
            "border-kit bg-kit-white text-kit-heading hover:border-kit-success";
        }
      }

      list.push(
        <button
          key={"edit-slot-" + slot.slotId}
          type="button"
          disabled={!available}
          onClick={() => setEditSlotId(slot.slotId)}
          className={
            "flex flex-col items-center justify-center gap-0.5 rounded border px-1 py-2 text-center " +
            classes
          }
        >
          <span className="text-xs font-bold">{slot.time}</span>
          <span className="text-xs opacity-90">{label}</span>
        </button>,
      );
    }

    return (
      <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6">
        {list}
      </div>
    );
  }

  function renderStatusList() {
    const items = [];
    for (let index = 0; index < STATUS_OPTIONS.length; index++) {
      const option = STATUS_OPTIONS[index];
      const selected = selectedStatus === option.value;
      const disabled = isStatusOptionDisabled(
        currentBackendStatus,
        option.value,
      );

      items.push(
        <ListGroupItem
          key={option.value}
          action
          disabled={disabled}
          tone={option.tone}
          onClick={() => {
            if (disabled) return;
            setSelectedStatus(option.value);
          }}
          className={selected ? "font-semibold " : ""}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={"h-2.5 w-2.5 shrink-0 rounded-full " + option.dotClass}
            />
            <span className="truncate">{option.label}</span>
          </span>
          {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
        </ListGroupItem>,
      );
    }
    return <ListGroup>{items}</ListGroup>;
  }

  function renderStaffField() {
    if (!canEditAssignment) {
      return <Input value={booking.staffName || "—"} readOnly />;
    }

    if (
      availabilityQuery.isLoading ||
      (!booking.slotId && timeSlotsQuery.isLoading)
    ) {
      return (
        <div className="flex h-9 items-center gap-1.5 text-sm text-kit-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Đang tải NV rảnh...
        </div>
      );
    }

    if (!resolvedSlotId || !booking.serviceId) {
      return (
        <p className="text-xs text-kit-muted">
          Thiếu slot/dịch vụ để lọc NV rảnh
        </p>
      );
    }

    return (
      <SearchableSelect
        value={selectedStaffId}
        onChange={setSelectedStaffId}
        options={staffOptions}
        placeholder="Chọn NV đang rảnh"
        searchPlaceholder="Tìm nhân viên..."
        className="w-full"
      />
    );
  }

  function renderPositionField() {
    if (!canEditAssignment) {
      return (
        <div className="flex h-9 items-center gap-1.5 text-sm text-kit-heading">
          <MapPin className="h-3.5 w-3.5 text-kit-primary" />
          {booking.positionName || "—"}
        </div>
      );
    }

    if (loadingPositions) {
      return (
        <div className="flex h-9 items-center gap-1.5 text-sm text-kit-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Đang tải...
        </div>
      );
    }

    return (
      <SearchableSelect
        value={selectedPositionId != null ? String(selectedPositionId) : ""}
        onChange={(value) =>
          setSelectedPositionId(value ? Number(value) : null)
        }
        options={positionOptions}
        placeholder="Chọn vị trí..."
        searchPlaceholder="Tìm phòng / vị trí..."
        className="w-full"
      />
    );
  }

  let durationLabel = "—";
  if (durationMins != null) {
    durationLabel = durationMins + " phút";
  }

  let depositLabel = "Chưa cọc";
  if (booking.depositPaid) {
    depositLabel = formatCurrency(
      Math.min(booking.paidAmount, booking.depositAmount),
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={"Lịch hẹn (Mã: " + code + ")"}
      size="xl"
      scrollable
      tone="primary"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0 mr-0"
            onClick={onClose}
          >
            Đóng
          </Button>
          {canPayInvoice ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mb-0 mr-0"
              onClick={() => onPayInvoice?.(booking)}
              loading={isPaying}
              disabled={isSaving}
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              Thanh toán
            </Button>
          ) : null}
          {!isCompleted ? (
            <Button
              type="button"
              variant="success"
              size="sm"
              className="mb-0 mr-0"
              onClick={handleSave}
              loading={isSaving}
              disabled={isPaying}
            >
              Lưu thông tin
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded border border-kit bg-kit-white p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-kit-page">
              <FallbackImage
                kind="customer"
                src={booking.customerAvatar}
                alt={booking.customerName ?? undefined}
                className="h-14 w-14 object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-kit-heading">
                <User className="h-4 w-4 shrink-0 text-kit-muted" />
                <span className="truncate">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-kit-muted">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{booking.customerPhone || "—"}</span>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-kit-muted">
              Mã: {code}
            </div>
          </div>

          <FormSection icon={User} title="Thông tin lịch hẹn">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Ngày hẹn" required={canReschedule}>
                {canReschedule ? (
                  <Input
                    type="date"
                    value={editDate}
                    min={formatDate(new Date()).format("YYYY-MM-DD")}
                    onChange={(e) => {
                      setEditDate(e.target.value);
                      setEditSlotId(null);
                    }}
                  />
                ) : (
                  <Input
                    value={formatDisplayDate(booking.bookingDate) || "—"}
                    readOnly
                  />
                )}
              </FormField>
              <FormField label="Giờ hẹn hiện tại">
                <Input
                  value={booking.startTime + " – " + booking.endTime}
                  readOnly
                />
              </FormField>
              <FormField label="Thời lượng">
                <Input value={durationLabel} readOnly />
              </FormField>
            </div>

            {canReschedule ? (
              <FormField
                label="Khung giờ mới"
                required
                help="Chọn khung trống. Hệ thống sẽ kiểm tra lại khi lưu."
              >
                {renderRescheduleSlots()}
              </FormField>
            ) : null}

            {booking.timeStartService ? (
              <FormField label="Thời gian bắt đầu phục vụ">
                <Input
                  value={formatDateTimeDisplay(booking.timeStartService)}
                  readOnly
                />
              </FormField>
            ) : null}
            {booking.completedAt ? (
              <FormField label="Thời gian hoàn thành">
                <Input
                  value={formatDateTimeDisplay(booking.completedAt)}
                  readOnly
                />
              </FormField>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Dịch vụ">
                <Input value={booking.serviceName || "—"} readOnly />
              </FormField>
              <FormField label="Nhân viên">{renderStaffField()}</FormField>
              <FormField label="Phòng / chỗ ngồi">
                {renderPositionField()}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <FormField label="Tổng tiền">
                <Input value={formatCurrency(booking.totalAmount)} readOnly />
              </FormField>
              <FormField label="Đã thu">
                <Input value={formatCurrency(booking.paidAmount)} readOnly />
              </FormField>
              <FormField label="Còn lại">
                <Input
                  value={formatCurrency(booking.remainingAmount)}
                  readOnly
                />
              </FormField>
              <FormField label="Cọc">
                <Input value={depositLabel} readOnly />
              </FormField>
            </div>

            <FormField label="Ghi chú">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú lịch hẹn"
                rows={3}
              />
            </FormField>
          </FormSection>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-kit-heading">Trạng thái</h3>
          {renderStatusList()}
        </div>
      </div>
    </Modal>
  );
}
