import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type { PayrollDto, GeneratePayrollPayload } from "../types/payroll.types";

const BASE = API.payrolls;

// Tham số lọc danh sách bảng lương
export interface PayrollListParams extends PageRequest {
  staffId?: number | null;
  salonId?: number | null;
  month?: number | null;
  year?: number | null;
  status?: number | null;
}

export interface UpdatePayrollPayload {
  baseAmount?: number;
  commissionAmount?: number;
  note?: string;
  status?: number;
}

export const payrollApi = {
  // GET /Payroll/admin — danh sách bảng lương (phân trang)
  getAll: (params: PayrollListParams) =>
    axiosInstance
      .get<Result<PagedResult<PayrollDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  // GET /Payroll/:id — chi tiết
  getDetail: (id: number) =>
    axiosInstance.get<Result<PayrollDto>>(`${BASE}/${id}`).then((r) => r.data),

  // POST /Payroll/generate — tính lương
  generate: (payload: GeneratePayrollPayload) =>
    axiosInstance.post<Result<number>>(`${BASE}/generate`, payload).then((r) => r.data),

  // POST /Payroll/:id/confirm — chốt bảng lương
  confirm: (id: number) =>
    axiosInstance.post<Result<number>>(`${BASE}/${id}/confirm`).then((r) => r.data),

  // PUT /Payroll/:id — cập nhật bảng lương
  update: (id: number, payload: UpdatePayrollPayload) =>
    axiosInstance.put<Result<number>>(`${BASE}/${id}`, payload).then((r) => r.data),
};
