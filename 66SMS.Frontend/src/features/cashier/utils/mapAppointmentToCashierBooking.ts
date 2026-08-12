import type { AppointmentDto } from "@/features/booking/types/booking.types";
import type { CashierBooking } from "../types";

function joinServiceNames(serviceNames?: string[]): string {
  if (!serviceNames || serviceNames.length === 0) {
    return "";
  }
  let result = "";
  for (let index = 0; index < serviceNames.length; index++) {
    if (index > 0) {
      result += ", ";
    }
    result += serviceNames[index];
  }
  return result;
}

export function mapAppointmentToCashierBooking(
  item: AppointmentDto,
): CashierBooking {
  const totalAmount = item.totalAmount ?? 0;
  const paidAmount = item.paidAmount ?? 0;
  return {
    id: String(item.id ?? ""),
    appointmentCode: item.appointmentCode,
    customerName: item.customerName,
    customerPhone: item.customerPhone,
    bookingDate: item.appointmentDate,
    serviceName: joinServiceNames(item.serviceNames),
    serviceId: null,
    staffId: item.staffId ?? 0,
    staffName: item.staffFullName,
    startTime: item.timeSlotStartTime ?? "",
    endTime: item.timeSlotEndTime ?? "",
    status: "pending",
    totalAmount,
    paidAmount,
    depositAmount: 0,
    remainingAmount: totalAmount - paidAmount,
    depositPaid: paidAmount > 0,
    depositDeadlineAt: item.depositDeadlineAt,
    note: item.note,
    positionId: item.positionId,
    positionName: item.positionName,
  };
}
