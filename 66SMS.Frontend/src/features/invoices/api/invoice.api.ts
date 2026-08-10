import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  InvoiceDto,
  CreateInvoicePayload,
  UpdateInvoiceItemsPayload,
  GetAllInvoicesQuery,
} from "../types/invoice.types";

export const invoiceApi = {
  getAll: (params: GetAllInvoicesQuery) =>
    axiosInstance
      .get<Result<PagedResult<InvoiceDto>>>(`/invoice/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<InvoiceDto>>(`/invoice/${id}`).then((r) => r.data),

  create: (payload: CreateInvoicePayload) =>
    axiosInstance.post<Result<number>>("/invoice", payload).then((r) => r.data),

  cancel: (id: number) =>
    axiosInstance
      .patch<Result<object>>(`/invoice/${id}/cancel`)
      .then((r) => r.data),

  createFromAppointment: (appointmentId: number | string) =>
    axiosInstance
      .post<Result<number>>(`/invoice/from-appointment/${appointmentId}`)
      .then((r) => r.data),

  updateItems: (id: number | string, payload: UpdateInvoiceItemsPayload) =>
    axiosInstance
      .put<Result<object>>(`/invoice/${id}/items`, payload)
      .then((r) => r.data),

  payInvoice: (
    id: number | string,
    paymentMethod: number,
    paidAmount: number,
    note?: string,
  ) =>
    axiosInstance
      .post<
        Result<object>
      >(`/invoice/${id}/pay`, { paymentMethod, paidAmount, note })
      .then((r) => r.data),
};
