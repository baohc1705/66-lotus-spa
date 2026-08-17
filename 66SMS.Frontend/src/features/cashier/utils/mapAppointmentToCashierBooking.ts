import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import type { AppointmentDto } from "@/features/booking/types/booking.types";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";
import type { CashierBooking } from "../types";

function joinServiceNames(names?: string[]): string {
  if (!names || names.length === 0) {
    return "";
  }
  let result = "";
  for (let index = 0; index < names.length; index++) {
    if (index > 0) {
      result += ", ";
    }
    result += names[index];
  }
  return result;
}

export function mapAppointmentToCashierBooking(
  item: AppointmentDto,
): CashierBooking {
  const totalAmount = item.totalAmount ?? 0;
  const paidAmount = item.paidAmount ?? 0;
  const depositPercent = item.depositPercent ?? 20;
  const depositAmount = Math.round((totalAmount * depositPercent) / 100);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const services: {
    serviceId?: number;
    name?: string;
    durationMins?: number;
    price?: number;
  }[] = [];
  const serviceIds: number[] = [];
  const sourceServices = item.services ?? [];
  for (let index = 0; index < sourceServices.length; index++) {
    const service = sourceServices[index];
    services.push({
      serviceId: service.serviceId,
      name: service.name,
      durationMins: service.durationMins,
      price: service.price,
    });
    if (service.serviceId) {
      serviceIds.push(service.serviceId);
    }
  }
  if (services.length === 0 && item.serviceNames) {
    for (let index = 0; index < item.serviceNames.length; index++) {
      services.push({
        name: item.serviceNames[index],
        durationMins: 0,
      });
    }
  }

  let serviceName = joinServiceNames(item.serviceNames);
  if (!serviceName && services.length > 0) {
    const names: string[] = [];
    for (let index = 0; index < services.length; index++) {
      if (services[index].name) names.push(services[index].name as string);
    }
    serviceName = joinServiceNames(names);
  }

  let positionName = item.positionName ?? undefined;
  if (item.positionRoomName && item.positionName) {
    positionName = item.positionRoomName + " — " + item.positionName;
  }

  const startTime =
    toLocalTimeOnly(item.timeSlotStartTime) || item.timeSlotStartTime || "";
  const endTime =
    toLocalTimeOnly(item.timeSlotEndTime) || item.timeSlotEndTime || "";

  return {
    id: String(item.id ?? ""),
    appointmentCode: item.appointmentCode,
    customerName: item.customerName,
    customerPhone: item.customerPhone,
    customerAvatar: item.customerAvatar,
    bookingDate: item.appointmentDate,
    serviceName,
    serviceId: serviceIds.length > 0 ? serviceIds[0] : null,
    serviceIds,
    services,
    staffId: item.staffId ?? 0,
    staffName: item.staffFullName,
    startTime,
    endTime,
    status: item.status ?? APPOINTMENT_STATUS.PENDING,
    totalAmount,
    paidAmount,
    depositAmount,
    remainingAmount,
    depositPaid: paidAmount >= depositAmount && depositAmount > 0,
    depositDeadlineAt: item.depositDeadlineAt,
    note: item.note,
    customerWalletBalance: item.customerWalletBalance ?? 0,
    invoiceId: item.invoiceId,
    invoiceCode: item.invoiceCode,
    positionId: item.positionId,
    positionName,
    positionStatus: item.positionStatus,
    timeStartService: item.timeStartService,
    completedAt: item.completedAt,
  };
}
