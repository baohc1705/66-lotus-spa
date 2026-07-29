import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import {
  APPOINTMENT_STATUS_DOT_CLASS,
  APPOINTMENT_STATUS_LABELS,
} from "@/features/booking/constants/appointment.constants";
import type { AppointmentDto } from "@/features/booking/types/booking.types";
import { useCustomerDetail } from "../hooks/useCustomers";
import { useCustomerAppointments } from "../hooks/useCustomerAppointments";

interface CustomerCrmAppointmentsProps {
  customerId: number | null;
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
  const totalPages = paged?.totalPages ?? 1;

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border border-adminGray-100 rounded shadow-sm p-6 text-center text-adminGray-400">
        <Calendar className="w-12 h-12 text-adminGray-300 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem lịch hẹn
        </p>
      </div>
    );
  }

  if (isLoadingCustomer || isLoadingAppointments) {
    return (
      <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm">
        <Header count={0} />
        <div className="flex-1 flex items-center justify-center p-6 text-center text-adminGray-400 text-xs">
          Khách hàng chưa có tài khoản nên chưa có lịch hẹn trên hệ thống
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm">
      <Header count={totalCount} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
        {appointments.length === 0 ? (
          <div className="text-center py-10 text-adminGray-400 text-xs italic">
            Chưa có lịch hẹn nào
          </div>
        ) : (
          appointments.map((item: AppointmentDto) => (
            <AppointmentCard key={item.id} appointment={item} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-2 border-t border-adminGray-100 bg-adminGray-50/50 flex items-center justify-between text-xs text-adminGray-600 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={pageIndex === 1}
            onClick={() => setPageIndex(pageIndex - 1)}
            className="h-7 w-7 text-adminGray-600 hover:text-adminInk"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            Trang {pageIndex} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={pageIndex === totalPages}
            onClick={() => setPageIndex(pageIndex + 1)}
            className="h-7 w-7 text-adminGray-600 hover:text-adminInk"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="p-3 border-b border-adminGray-100 shrink-0 flex items-center justify-between">
      <h3 className="text-sm font-bold text-adminInk flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-adminGreen-600" />
        Lịch hẹn
      </h3>
      <span className="text-2xs font-semibold bg-adminGray-100 text-adminGray-600 px-2 py-0.5 rounded">
        {count}
      </span>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: AppointmentDto }) {
  const status = appointment.status ?? 0;
  const statusLabel = APPOINTMENT_STATUS_LABELS[status] ?? "Không rõ";
  const statusDot = APPOINTMENT_STATUS_DOT_CLASS[status] ?? "bg-adminGray-300";

  const startTime = appointment.timeSlotStartTime
    ? appointment.timeSlotStartTime.substring(0, 5)
    : null;
  const endTime = appointment.timeSlotEndTime
    ? appointment.timeSlotEndTime.substring(0, 5)
    : null;
  const timeLabel =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime || "Chưa xếp giờ";

  const services =
    appointment.serviceNames && appointment.serviceNames.length > 0
      ? appointment.serviceNames.join(", ")
      : null;

  return (
    <div className="border border-adminGray-100 rounded-lg p-2.5 bg-adminGray-50/40 text-xs space-y-1.5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-bold text-adminInk truncate">
            {appointment.appointmentCode || `#${appointment.id}`}
          </p>
          <p className="text-adminGray-600 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 shrink-0" />
            {appointment.appointmentDate
              ? formatDisplayDate(appointment.appointmentDate)
              : "—"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-2xs font-semibold bg-white border border-adminGray-100 text-adminInk px-1.5 py-0.5 rounded shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </span>
      </div>

      <p className="text-adminGray-600 flex items-center gap-1">
        <Clock className="w-3 h-3 shrink-0" />
        {timeLabel}
      </p>

      {appointment.salonName && (
        <p className="text-adminGray-600 flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {appointment.salonName}
        </p>
      )}

      {services && (
        <p className="text-adminInk font-medium line-clamp-2">{services}</p>
      )}

      {appointment.staffFullName && (
        <p className="text-adminGray-600">
          NV: <span className="text-adminInk">{appointment.staffFullName}</span>
        </p>
      )}

      {(appointment.totalAmount != null || appointment.paidAmount != null) && (
        <div className="flex justify-between pt-1.5 border-t border-adminGray-100 text-adminGray-600">
          <span>Tổng: {formatCurrency(appointment.totalAmount)}</span>
          <span>Đã trả: {formatCurrency(appointment.paidAmount)}</span>
        </div>
      )}
    </div>
  );
}
