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
