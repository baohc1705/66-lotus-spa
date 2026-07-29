import type { AxiosError } from "axios";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoiceApi } from "../api/invoice.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  CreateInvoicePayload,
  GetAllInvoicesQuery,
} from "../types/invoice.types";
import type { Result } from "@/shared/types/common.types";

const ENTITY = "hóa đơn";

export const KEYS = createEntityQueryKeys<GetAllInvoicesQuery>("keys");

export function useInvoices(params: GetAllInvoicesQuery) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => invoiceApi.getAll(params),
  });
}

export function useAdminInvoices(params: GetAllInvoicesQuery, enabled = true) {
  return useQuery({
    queryKey: KEYS.adminList(params),
    queryFn: () => invoiceApi.getAll(params),
    enabled,
  });
}

export function useInvoiceDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => invoiceApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => invoiceApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("lập", ENTITY)));
    },
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => invoiceApi.cancel(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Hủy", ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, TOAST_MSG.subActionError("hủy", ENTITY)),
      );
    },
  });
}
