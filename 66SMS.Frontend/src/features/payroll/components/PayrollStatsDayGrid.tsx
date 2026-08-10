import {
  Calendar,
  type CalendarEvent,
} from "@/shared/components/Calendar";
import { formatCurrency } from "@/shared/utils/currency";

import type { PayrollCommissionAppointmentDto } from "../types/payroll.types";
import {
  appointmentKey,
  formatSlotTime,
  resolveServiceEndTime,
  toCalendarDateTime,
  toDateKey,
} from "../utils/payrollStats.utils";

type PayrollStatsDayGridProps = {
  date: Date;
  appointments: PayrollCommissionAppointmentDto[];
  staffName: string;
  onAppointmentClick: (item: PayrollCommissionAppointmentDto) => void;
  onDateChange?: (date: Date) => void;
};

const EVENT_COLOR = "#22c55e";

export function PayrollStatsDayGrid({
  date,
  appointments,
  staffName,
  onAppointmentClick,
  onDateChange,
}: PayrollStatsDayGridProps) {
  const dateKey = toDateKey(date);
  const byId = new Map<string, PayrollCommissionAppointmentDto>();
  const events: CalendarEvent[] = [];

  appointments.forEach((item: PayrollCommissionAppointmentDto) => {
    const eventDate = item.issuedLocalDate ?? item.appointmentDate ?? dateKey;
    if (eventDate !== dateKey) return;

    const startText = formatSlotTime(item.slotStartTime);
    const endText = resolveServiceEndTime(
      item.slotStartTime,
      item.slotEndTime,
      item.durationMins,
    );
    const start = toCalendarDateTime(eventDate, startText);
    const end = toCalendarDateTime(eventDate, endText);
    if (!start || !end) return;

    const id = appointmentKey(item.appointmentId, item.invoiceId);
    byId.set(id, item);
    events.push({
      id,
      title: `${item.customerName ?? "Khách"} · ${formatCurrency(item.totalCommission)}`,
      description: `${item.serviceName ?? "Dịch vụ"} · ${staffName}`,
      start,
      end,
      color: EVENT_COLOR,
    });
  });

  return (
    <Calendar
      className="h-full min-h-[480px]"
      events={events}
      view="day"
      date={date}
      onDateChange={onDateChange}
      readOnly
      hideViewSwitcher
      onEventClick={(event: CalendarEvent) => {
        const item = byId.get(event.id);
        if (item) onAppointmentClick(item);
      }}
    />
  );
}
