import type { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invoiceApi } from "@/features/invoices/api/invoice.api";
import type {
  CreateInvoiceRequest,
  GetAllInvoiceQuery,
} from "@/features/invoices/types/invoice.types";
import type { Result } from "@/shared/types/common.types";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";

const ENTITY = "hóa đơn";

export const INVOICE_QUERY_KEY =
  createEntityQueryKeys<GetAllInvoiceQuery>("invoices");

// Query list
export function useInvoices(params: GetAllInvoiceQuery, enabled = true) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEY.list(params),
    queryFn: () => invoiceApi.getAll(params),
    enabled,
  });
}

// Query detail
export function useInvoiceDetail(id: number | null) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEY.detail(id ?? 0),
    queryFn: () => invoiceApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

// Mutation create
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoiceRequest) => invoiceApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi tạo ${ENTITY}`);
        return;
      }

      qc.invalidateQueries({ queryKey: INVOICE_QUERY_KEY.all });
      showSuccess(`Tạo ${ENTITY} thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo ${ENTITY}`));
    },
  });
}

// Mutation cancel
export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => invoiceApi.cancel(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || `Có lỗi xảy ra khi hủy ${ENTITY}`);
        return;
      }

      qc.invalidateQueries({ queryKey: INVOICE_QUERY_KEY.all });
      showSuccess(`Hủy ${ENTITY} thành công`);
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Đã xảy ra lỗi khi hủy ${ENTITY}`));
    },
  });
}
