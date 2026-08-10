import { useState } from "react";
import { Calendar } from "lucide-react";

import { Pagination } from "@/shared/components/Pagination";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Card, CardBody } from "@/shared/elements/Card";
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
} from "@/features/booking/constants/appointment.constants";
import type { AppointmentDto } from "@/features/booking/types/booking.types";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDisplayDate } from "@/shared/utils/date.utils";

import { useCustomerAppointments } from "../hooks/useCustomerAppointments";
import { useCustomerDetail } from "../hooks/useCustomers";

interface CustomerCrmAppointmentsProps {
  customerId: number | null;
}

function getStatusBadgeVariant(status: number): BadgeVariant {
  if (status === APPOINTMENT_STATUS.PENDING) return "secondary";
  if (status === APPOINTMENT_STATUS.CONFIRMED) return "primary";
  if (status === APPOINTMENT_STATUS.WAITING) return "warning";
  if (status === APPOINTMENT_STATUS.IN_SERVICE) return "info";
  if (status === APPOINTMENT_STATUS.COMPLETED) return "success";
  if (status === APPOINTMENT_STATUS.CANCELLED) return "danger";
  if (status === APPOINTMENT_STATUS.NO_SHOW) return "dark";
  return "secondary";
}

export function CustomerCrmAppointments({
  customerId,
}: CustomerCrmAppointmentsProps) {
  const [pageIndex, setPageIndex] = useState(1);

  const { data: customerResult, isLoading: isLoadingCustomer } =
    useCustomerDetail(customerId);
  const customer = customerResult?.data;
  const userId = customer?.userId ?? null;

  const { data: paged, isLoading: isLoadingAppointments } =
    useCustomerAppointments(userId, pageIndex);

  const appointments = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 1);

  if (!customerId) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-center text-kit-muted shadow-kit-card">
        <Calendar className="mb-2 h-12 w-12 stroke-[1.5] text-kit-muted/60" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem lịch hẹn
        </p>
      </div>
    );
  }

  if (isLoadingCustomer || isLoadingAppointments) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-kit-muted shadow-kit-card">
        <p className="text-sm">Đang tải lịch hẹn...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
        <Header count={0} />
        <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-kit-muted">
          Khách hàng chưa có tài khoản nên chưa có lịch hẹn trên hệ thống
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
      <Header count={totalCount} />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {appointments.length === 0 ? (
          <p className="py-10 text-center text-xs italic text-kit-muted">
            Chưa có lịch hẹn nào
          </p>
        ) : (
          appointments.map((item: AppointmentDto) => (
            <AppointmentCard key={item.id} appointment={item} />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex shrink-0 justify-center border-t border-kit bg-kit-page/50 p-2">
          <Pagination
            page={pageIndex}
            pageCount={totalPages}
            onPageChange={setPageIndex}
            size="sm"
          />
        </div>
      ) : null}
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-kit p-3">
      <h3 className="mb-0 flex items-center gap-1.5 text-sm font-bold text-kit-heading">
        <Calendar className="h-4 w-4 text-kit-primary" />
        Lịch hẹn
      </h3>
      <Badge variant="secondary" soft className="normal-case">
        {count}
      </Badge>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: AppointmentDto }) {
  const status = appointment.status ?? 0;
  const statusLabel = APPOINTMENT_STATUS_LABELS[status] ?? "Không rõ";
  const badgeVariant = getStatusBadgeVariant(status);

  const startTime = appointment.timeSlotStartTime
    ? appointment.timeSlotStartTime.substring(0, 5)
    : null;
  const endTime = appointment.timeSlotEndTime
    ? appointment.timeSlotEndTime.substring(0, 5)
    : null;

  const dateLabel = appointment.appointmentDate
    ? formatDisplayDate(appointment.appointmentDate)
    : null;

  let whenLabel = "Chưa xếp lịch";
  if (dateLabel && startTime && endTime) {
    whenLabel = `${dateLabel}, ${startTime}-${endTime}`;
  } else if (dateLabel && startTime) {
    whenLabel = `${dateLabel}, ${startTime}`;
  } else if (dateLabel) {
    whenLabel = dateLabel;
  } else if (startTime && endTime) {
    whenLabel = `${startTime}-${endTime}`;
  }

  const serviceName =
    appointment.serviceNames && appointment.serviceNames.length > 0
      ? appointment.serviceNames.join(", ")
      : appointment.appointmentCode || `#${appointment.id}`;

  const code = appointment.appointmentCode || `#${appointment.id}`;
  const hasMoney =
    appointment.totalAmount != null || appointment.paidAmount != null;

  return (
    <div title={code}>
      <Card className="mb-0 shadow-none" borderTone="secondary">
        <CardBody className="space-y-1 p-2.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <p className="mb-0 min-w-0 flex-1 truncate font-semibold text-kit-heading">
              {serviceName}
            </p>
            <Badge variant={badgeVariant} soft className="shrink-0 normal-case">
              {statusLabel}
            </Badge>
          </div>

          <p className="mb-0 truncate text-kit-body">{whenLabel}</p>

          {appointment.staffFullName ? (
            <p className="mb-0 truncate text-kit-muted">
              {appointment.staffFullName}
            </p>
          ) : null}

          {appointment.salonName ? (
            <p className="mb-0 truncate text-kit-muted">
              {appointment.salonName}
            </p>
          ) : null}

          {hasMoney ? (
            <p className="mb-0 flex items-center justify-between border-t border-kit pt-1 font-medium">
              <span className="text-kit-heading">
                {formatCurrency(appointment.totalAmount)}
              </span>
              <span
                className={
                  (appointment.paidAmount ?? 0) > 0
                    ? "text-state-success-text"
                    : "text-kit-muted"
                }
              >
                {formatCurrency(appointment.paidAmount)}
              </span>
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
