import { CalendarDays, CheckCircle2, Play } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Textarea } from "@/shared/forms/Textarea";
import {
  formatDateTimeDisplay,
  toLocalTimeOnly,
} from "@/shared/utils/date.utils";
import {
  BOOKING_STATUS_LABELS,
  BookingStatus,
  type StaffScheduleBooking,
} from "../types";

interface BookingDetailPanelProps {
  booking: StaffScheduleBooking | null;
  dateLabel?: string;
  onClose: () => void;
  onStartService?: (bookingId: string) => void;
  onCompleteService?: (bookingId: string) => void;
  isUpdating?: boolean;
}

function calcDurationMins(startTime: string, endTime: string) {
  const start = toLocalTimeOnly(startTime);
  const end = toLocalTimeOnly(endTime);
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const startHour = startParts[0];
  const startMinute = startParts[1];
  const endHour = endParts[0];
  const endMinute = endParts[1];
  if (
    [startHour, startMinute, endHour, endMinute].some((value) =>
      Number.isNaN(value),
    )
  ) {
    return null;
  }
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function getStatusBadgeVariant(status: number): BadgeVariant {
  if (status === BookingStatus.Pending) return "secondary";
  if (status === BookingStatus.Confirmed) return "primary";
  if (status === BookingStatus.Waiting) return "warning";
  if (status === BookingStatus.InService) return "info";
  if (status === BookingStatus.Completed) return "success";
  if (status === BookingStatus.Cancelled) return "danger";
  if (status === BookingStatus.NoShow) return "dark";
  return "secondary";
}

export function BookingDetailPanel({
  booking,
  dateLabel,
  onClose,
  onStartService,
  onCompleteService,
  isUpdating = false,
}: BookingDetailPanelProps) {
  const code = booking?.appointmentCode || booking?.id || "";
  const canStart = booking?.status === BookingStatus.Waiting;
  const canComplete = booking?.status === BookingStatus.InService;
  const durationMins = booking
    ? calcDurationMins(booking.startTime, booking.endTime)
    : null;
  const statusLabel = booking
    ? (BOOKING_STATUS_LABELS[booking.status] ?? `Trạng thái #${booking.status}`)
    : "";
  const completedAtLabel = booking?.completedAt
    ? formatDateTimeDisplay(booking.completedAt)
    : "—";
  const timeStartServiceLabel = booking?.timeStartService
    ? formatDateTimeDisplay(booking.timeStartService)
    : "—";
  const timeRange = booking
    ? `${toLocalTimeOnly(booking.startTime)} - ${toLocalTimeOnly(booking.endTime)}`
    : "";

  return (
    <Modal
      open={booking != null}
      onClose={onClose}
      title={code ? `Lịch hẹn (Mã: ${code})` : "Lịch hẹn"}
      size="lg"
      scrollable
      
      footer={
        booking ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mb-0"
              onClick={onClose}
            >
              Đóng
            </Button>
            {canStart && onStartService ? (
              <Button
                type="button"
                variant="info"
                size="sm"
                className="mb-0"
                loading={isUpdating}
                onClick={() => onStartService(booking.id)}
              >
                <Play className="mr-1.5 h-4 w-4" />
                Bắt đầu phục vụ
              </Button>
            ) : null}
            {canComplete && onCompleteService ? (
              <Button
                type="button"
                variant="success"
                size="sm"
                className="mb-0"
                loading={isUpdating}
                onClick={() => onCompleteService(booking.id)}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Hoàn thành phục vụ
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {booking ? (
        <div className="space-y-4">
          {dateLabel ? (
            <p className="mb-0 text-sm text-kit-muted">{dateLabel}</p>
          ) : null}

          <FormSection icon={CalendarDays} title="Thông tin lịch hẹn">
            <FormField label="Dịch vụ">
              <Input
                value={booking.serviceName || "—"}
                readOnly
                disabled
              />
            </FormField>

            <FormField label="Giờ hẹn">
              <Input value={timeRange} readOnly disabled />
            </FormField>

            <FormField label="Khách hàng">
              <Input
                value={booking.customerName || "—"}
                readOnly
                disabled
              />
            </FormField>

            <FormRow>
              <FormField label="Số điện thoại">
                <Input
                  value={booking.customerPhone || "—"}
                  readOnly
                  disabled
                />
              </FormField>
              <FormField label="Mã lịch hẹn">
                <Input value={code || "—"} readOnly disabled />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField label="Ngày hẹn">
                <Input value={dateLabel || "—"} readOnly disabled />
              </FormField>
              <FormField label="Thời lượng">
                <Input
                  value={
                    durationMins != null ? `${durationMins} phút` : "—"
                  }
                  readOnly
                  disabled
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField label="Thời gian bắt đầu phục vụ">
                <Input value={timeStartServiceLabel} readOnly disabled />
              </FormField>
              <FormField label="Thời gian hoàn thành">
                <Input value={completedAtLabel} readOnly disabled />
              </FormField>
            </FormRow>

            <FormField label="Phòng / Chỗ ngồi">
              <Input
                value={booking.positionName || "—"}
                readOnly
                disabled
              />
            </FormField>

            <FormField label="Trạng thái">
              <div className="pt-1">
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {statusLabel}
                </Badge>
              </div>
            </FormField>

            {booking.note ? (
              <FormField label="Ghi chú">
                <Textarea value={booking.note} readOnly disabled rows={3} />
              </FormField>
            ) : null}
          </FormSection>
        </div>
      ) : null}
    </Modal>
  );
}
