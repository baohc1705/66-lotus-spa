import { useState } from "react";
import { Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
} from "@/features/booking/constants/appointment.constants";
import type { AppointmentDto } from "@/features/booking/types/booking.types";
import {
  useCustomerAppointments,
  useCustomerDetail,
} from "@/features/customers/hooks/useCustomers";

import { Pagination } from "@/shared/components/Pagination";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody } from "@/shared/elements/Card";
import { formatDisplayDate, toLocalTimeOnly } from "@/shared/utils/date.utils";
import { DEFAULT_PAGE_SIZE } from "@/shared/constants/display.const";

interface CustomerAppointmentsProps {
  customerId: number | null;
}

function getStatusBadgeVariant(status: number): BadgeVariant {
  if (status === APPOINTMENT_STATUS.PENDING) return "secondary";
  if (status === APPOINTMENT_STATUS.CONFIRMED) return "primary";
  if (status === APPOINTMENT_STATUS.WAITING) return "warning";
  if (status === APPOINTMENT_STATUS.IN_SERVICE) return "info";
  if (status === APPOINTMENT_STATUS.COMPLETED) return "success";
  if (status === APPOINTMENT_STATUS.CANCELLED) return "danger";
  return "secondary";
}

function AppointmentHeader({ count }: { count: number }) {
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

export function CustomerAppointments({
  customerId,
}: CustomerAppointmentsProps) {
  const navigate = useNavigate();
  // phân trang
  const [pageIndex, setPageIndex] = useState(1);

  // query chi tiết khách hàng
  const { data: customerResult, isLoading: isLoadingCustomer } =
    useCustomerDetail(customerId ?? 0);
  const customer = customerResult?.data;
  const userId = customer?.userId ?? null;

  // query danh sách lịch hẹn của khách hàng
  const { data: appointmentsResult, isLoading: isLoadingAppointments } =
    useCustomerAppointments({
      userId: userId ?? 0,
      pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  // lấy dữ liệu phân trang
  const paged = appointmentsResult;
  const appointments = paged?.items ?? [];
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 1);

  // nếu không có khách hàng được chọn
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

  // nếu đang tải dữ liệu
  if (isLoadingCustomer || isLoadingAppointments) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-kit-muted shadow-kit-card">
        <p className="text-sm">Đang tải lịch hẹn...</p>
      </div>
    );
  }

  // nếu không có user id
  if (!userId) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
        <AppointmentHeader count={0} />
        <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-kit-muted">
          Khách hàng chưa có tài khoản nên chưa có lịch hẹn trên hệ thống
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
      <AppointmentHeader count={totalCount} />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {appointments.length === 0 ? (
          <p className="py-10 text-center text-xs italic text-kit-muted">
            Chưa có lịch hẹn nào
          </p>
        ) : (
          appointments.map((item: AppointmentDto) =>
            (() => {
              const status = item.status ?? 0;
              const statusLabel = APPOINTMENT_STATUS_LABELS[status];
              const badgeVariant = getStatusBadgeVariant(status);

              const startTime = item.timeSlotStartTime
                ? toLocalTimeOnly(item.timeSlotStartTime)
                : null;
              const endTime = item.timeSlotEndTime
                ? toLocalTimeOnly(item.timeSlotEndTime)
                : null;
              const dateLabel = item.appointmentDate
                ? formatDisplayDate(item.appointmentDate)
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

              const code = item.appointmentCode || `#${item.id}`;

              return (
                <div title={code} key={item.id}>
                  <Card className="mb-0 shadow-none" borderTone="secondary">
                    <CardBody className="space-y-1 p-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <p className="mb-0 min-w-0 flex-1 truncate font-semibold text-kit-heading">
                          {item.appointmentCode}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          {item.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mb-0 h-7 w-7 p-0"
                              title="Xem chi tiết tại thu ngân"
                              onClick={() =>
                                navigate(`/thu-ngan?appointmentId=${item.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 text-kit-primary" />
                            </Button>
                          ) : null}
                          <Badge
                            variant={badgeVariant}
                            soft
                            className="normal-case text-xs"
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>
                      <p className="mb-0 truncate text-xs text-kit-body">
                        {whenLabel}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              );
            })(),
          )
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
