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
} from "../utils/payrollStats.utils";

type DayColumn = {
  date: string;
  appointments: PayrollCommissionAppointmentDto[];
};

type PayrollStatsWeekGridProps = {
  days: DayColumn[];
  highlightDate?: Date;
  onAppointmentClick: (item: PayrollCommissionAppointmentDto) => void;
  onDateChange?: (date: Date) => void;
};

const EVENT_COLOR = "#22c55e";

export function PayrollStatsWeekGrid({
  days,
  highlightDate,
  onAppointmentClick,
  onDateChange,
}: PayrollStatsWeekGridProps) {
  const byId = new Map<string, PayrollCommissionAppointmentDto>();
  const events: CalendarEvent[] = [];

  days.forEach((day: DayColumn) => {
    day.appointments.forEach((item: PayrollCommissionAppointmentDto) => {
      const startText = formatSlotTime(item.slotStartTime);
      const endText = resolveServiceEndTime(
        item.slotStartTime,
        item.slotEndTime,
        item.durationMins,
      );
      const start = toCalendarDateTime(day.date, startText);
      const end = toCalendarDateTime(day.date, endText);
      if (!start || !end) return;

      const id = `${day.date}-${appointmentKey(item.appointmentId, item.invoiceId)}`;
      byId.set(id, item);
      events.push({
        id,
        title: `${item.customerName ?? "Khách"} · ${formatCurrency(item.totalCommission)}`,
        description: item.serviceName ?? "Dịch vụ",
        start,
        end,
        color: EVENT_COLOR,
      });
    });
  });

  return (
    <Calendar
      className="h-full min-h-[480px]"
      events={events}
      view="week"
      date={highlightDate ?? new Date()}
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
