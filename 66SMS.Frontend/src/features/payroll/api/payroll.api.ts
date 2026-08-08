import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  PayrollDto,
  GeneratePayrollPayload,
  PayrollCommissionStatsDto,
  PayrollCommissionDailyStatsDto,
  PayrollCommissionStatsParams,
} from "../types/payroll.types";


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
  getAll: (params: PayrollListParams) =>
    axiosInstance
      .get<Result<PagedResult<PayrollDto>>>(`/payroll/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<PayrollDto>>(`/payroll/${id}`).then((r) => r.data),

  generate: (payload: GeneratePayrollPayload) =>
    axiosInstance
      .post<Result<number>>(`/payroll/generate`, payload)
      .then((r) => r.data),

  confirm: (id: number) =>
    axiosInstance
      .post<Result<number>>(`/payroll/${id}/confirm`)
      .then((r) => r.data),

  update: (id: number, payload: UpdatePayrollPayload) =>
    axiosInstance
      .put<Result<number>>(`/payroll/${id}`, payload)
      .then((r) => r.data),

  getCommissionStats: (params: PayrollCommissionStatsParams) =>
    axiosInstance
      .get<Result<PayrollCommissionStatsDto>>(`/payroll/stats`, { params })
      .then((r) => r.data),

  getCommissionDailyStats: (params: PayrollCommissionStatsParams) =>
    axiosInstance
      .get<Result<PayrollCommissionDailyStatsDto>>(`/payroll/stats/daily`, {
        params,
      })
      .then((r) => r.data),
};
