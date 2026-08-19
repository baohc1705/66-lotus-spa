import type { AxiosError } from "axios";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";
import { invoiceApi } from "../api/invoice.api";
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
        qc.invalidateQueries({ queryKey: KEYS.all });
        toast.success(`Tạo ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi lập ${ENTITY}`));
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
        toast.success(`Hủy ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, `Đã xảy ra lỗi khi hủy ${ENTITY}`),
      );
    },
  });
}
