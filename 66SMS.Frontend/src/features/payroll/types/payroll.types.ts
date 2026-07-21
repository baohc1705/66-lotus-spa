// DTO bảng lương trả về từ API
export interface PayrollDto {
  id: number | null;
  staffId: number | null;
  staffName: string | null;
  salonId: number | null;
  salonName: string | null;
  periodMonth: number | null;
  periodYear: number | null;
  salaryType: number | null;
  rate: number | null;
  totalHours: number | null;
  totalWorkDays: number | null;
  baseAmount: number | null;
  commissionAmount: number | null;
  totalAmount: number | null;
  standardWorkDays: number | null;
  status: number | null;
  note: string | null;
  createdAt: string | null;
}

// Payload tính lương
export interface GeneratePayrollPayload {
  staffId: number;
  month: number;
  year: number;
  excludeSaturday?: boolean;
}

export type PayrollStatsViewMode = "day" | "week" | "month";

export interface PayrollCommissionLineDto {
  invoiceItemId: number | null;
  itemType: number | null;
  itemRefId: number | null;
  itemName: string | null;
  unitPrice: number | null;
  quantity: number | null;
  discountAmount: number | null;
  lineTotal: number | null;
  commissionRate: number | null;
  commissionAmount: number;
  note: string | null;
}

export interface PayrollCommissionAppointmentDto {
  appointmentId: number | null;
  appointmentCode: string | null;
  appointmentDate: string | null;
  issuedLocalDate: string | null;
  appointmentStatus: number | null;
  appointmentNote: string | null;
  appointmentTotalAmount: number | null;
  appointmentPaidAmount: number | null;
  depositPercent: number | null;
  completedAt: string | null;
  slotId: number | null;
  slotStartTime: string | null;
  slotEndTime: string | null;
  durationMins: number | null;
  positionId: number | null;
  salonId: number | null;
  invoiceId: number | null;
  invoiceCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
  invoiceTotalAmount: number | null;
  invoicePaidAmount: number | null;
  invoicePaymentMethod: number | null;
  invoiceStatus: number | null;
  invoiceIssuedAt: string | null;
  serviceName: string | null;
  totalCommission: number;
  lines: PayrollCommissionLineDto[];
}

export interface PayrollCommissionSummaryDto {
  totalAppointments: number;
  totalServices: number;
  totalCommission: number;
  basicSalary: number | null;
  estimatedTotal: number;
}

export interface PayrollCommissionStatsDto {
  staffId: number;
  staffName: string | null;
  basicSalary: number | null;
  salaryType: number | null;
  fromDate: string | null;
  toDate: string | null;
  summary: PayrollCommissionSummaryDto;
  appointments: PayrollCommissionAppointmentDto[];
}

export interface PayrollCommissionStatsParams {
  staffId?: number;
  from: string;
  to: string;
}
