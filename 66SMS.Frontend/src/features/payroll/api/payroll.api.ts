import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  PayrollDto,
  GeneratePayrollPayload,
  PayrollCommissionStatsDto,
  PayrollCommissionStatsParams,
} from "../types/payroll.types";

const BASE = API.payrolls;

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
      .get<Result<PagedResult<PayrollDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<PayrollDto>>(`${BASE}/${id}`).then((r) => r.data),

  generate: (payload: GeneratePayrollPayload) =>
    axiosInstance
      .post<Result<number>>(`${BASE}/generate`, payload)
      .then((r) => r.data),

  confirm: (id: number) =>
    axiosInstance
      .post<Result<number>>(`${BASE}/${id}/confirm`)
      .then((r) => r.data),

  update: (id: number, payload: UpdatePayrollPayload) =>
    axiosInstance
      .put<Result<number>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  getCommissionStats: (params: PayrollCommissionStatsParams) =>
    axiosInstance
      .get<Result<PayrollCommissionStatsDto>>(`${BASE}/stats`, { params })
      .then((r) => r.data),
};
