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
} from "../utils/payrollStats.utils";

interface DayColumn {
  date: string;
  appointments: PayrollCommissionAppointmentDto[];
}

interface PayrollStatsWeekGridProps {
  days: DayColumn[];
  highlightDate?: Date;
  onAppointmentClick: (item: PayrollCommissionAppointmentDto) => void;
}

export function PayrollStatsWeekGrid({
  days,
  highlightDate,
  onAppointmentClick,
}: PayrollStatsWeekGridProps) {
  const byId = new Map<string, PayrollCommissionAppointmentDto>();
  const events: AdminScheduleEvent[] = [];

  days.forEach((day) => {
    day.appointments.forEach((item) => {
      const start = formatSlotTime(item.slotStartTime);
      const end = resolveServiceEndTime(
        item.slotStartTime,
        item.slotEndTime,
        item.durationMins,
      );
      if (start === "--:--" || end === "--:--") return;

      const id = `${day.date}-${appointmentKey(item.appointmentId, item.invoiceId)}`;
      byId.set(id, item);
      events.push({
        id,
        date: day.date,
        title: item.customerName ?? "Khách hàng",
        subtitle: item.serviceName ?? "Dịch vụ",
        startTime: start,
        endTime: end,
        footerRight: formatCurrency(item.totalCommission),
        status: "paid",
      });
    });
  });

  return (
    <AdminScheduleGrid
      days={days.map((d) => ({ date: d.date }))}
      events={events}
      highlightDate={highlightDate}
      onEventClick={(event) => {
        const item = byId.get(event.id);
        if (item) onAppointmentClick(item);
      }}
    />
  );
}
