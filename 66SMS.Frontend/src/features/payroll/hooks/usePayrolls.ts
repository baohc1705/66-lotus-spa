import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  payrollApi,
  type PayrollListParams,
  type UpdatePayrollPayload,
} from "../api/payroll.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import type {
  GeneratePayrollPayload,
  PayrollCommissionStatsParams,
} from "../types/payroll.types";

const PAYROLL_KEYS = {
  all: ["payrolls"] as const,
  lists: () => [...PAYROLL_KEYS.all, "list"] as const,
  list: (params: PayrollListParams) =>
    [...PAYROLL_KEYS.lists(), params] as const,
};

export function usePayrolls(params: PayrollListParams) {
  return useQuery({
    queryKey: PAYROLL_KEYS.list(params),
    queryFn: () => payrollApi.getAll(params),
  });
}

export function useGeneratePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneratePayrollPayload) =>
      payrollApi.generate(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
        toast.success("Tính lương thành công");
      } else {
        toast.error(result.message || "Không thể tính lương");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useConfirmPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => payrollApi.confirm(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
        toast.success("Chốt bảng lương thành công");
      } else {
        toast.error(result.message || "Không thể chốt bảng lương");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function useUpdatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePayrollPayload;
    }) => payrollApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
        toast.success("Cập nhật bảng lương thành công");
      } else {
        toast.error(result.message || "Không thể cập nhật bảng lương");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error)),
  });
}

export function usePayrollCommissionStats(
  params: PayrollCommissionStatsParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: [...PAYROLL_KEYS.all, "stats", params],
    queryFn: () => payrollApi.getCommissionStats(params!),
    enabled: enabled && !!params,
  });
}

export function usePayrollCommissionDailyStats(
  params: PayrollCommissionStatsParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: [...PAYROLL_KEYS.all, "stats-daily", params],
    queryFn: () => payrollApi.getCommissionDailyStats(params!),
    enabled: enabled && !!params,
  });
}
