import { formatCurrency } from "@/shared/utils/currency";
import {
  AdminScheduleGrid,
  type AdminScheduleEvent,
} from "@/shared/components/calendar/AdminScheduleGrid";
import type { PayrollCommissionAppointmentDto } from "../types/payroll.types";
import {
  appointmentKey,
  formatSlotTime,
  resolveServiceEndTime,
  toDateKey,
} from "../utils/payrollStats.utils";

interface PayrollStatsDayGridProps {
  date: Date;
  appointments: PayrollCommissionAppointmentDto[];
  staffName: string;
  onAppointmentClick: (item: PayrollCommissionAppointmentDto) => void;
}

function toEvent(
  item: PayrollCommissionAppointmentDto,
  dateKey: string,
): AdminScheduleEvent | null {
  const start = formatSlotTime(item.slotStartTime);
  const end = resolveServiceEndTime(
    item.slotStartTime,
    item.slotEndTime,
    item.durationMins,
  );
  if (start === "--:--" || end === "--:--") return null;

  return {
    id: appointmentKey(item.appointmentId, item.invoiceId),
    date: dateKey,
    title: item.customerName ?? "Khách hàng",
    subtitle: item.serviceName ?? "Dịch vụ",
    startTime: start,
    endTime: end,
    footerRight: formatCurrency(item.totalCommission),
    status: "paid",
  };
}

export function PayrollStatsDayGrid({
  date,
  appointments,
  staffName,
  onAppointmentClick,
}: PayrollStatsDayGridProps) {
  const dateKey = toDateKey(date);
  const byId = new Map<string, PayrollCommissionAppointmentDto>();
  const events: AdminScheduleEvent[] = [];

  appointments.forEach((item) => {
    const eventDate = item.issuedLocalDate ?? item.appointmentDate ?? dateKey;
    if (eventDate !== dateKey) return;

    const event = toEvent(item, dateKey);
    if (!event) return;
    byId.set(event.id, item);
    events.push(event);
  });

  return (
    <AdminScheduleGrid
      days={[{ date: dateKey }]}
      events={events}
      columnTitle={staffName}
      highlightDate={date}
      onEventClick={(event) => {
        const item = byId.get(event.id);
        if (item) onAppointmentClick(item);
      }}
    />
  );
}
