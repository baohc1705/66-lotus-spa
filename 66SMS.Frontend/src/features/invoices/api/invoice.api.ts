import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  InvoiceDto,
  CreateInvoicePayload,
  UpdateInvoiceItemsPayload,
  GetAllInvoicesQuery,
} from "../types/invoice.types";

const BASE = API.invoices;

export const invoiceApi = {
  getAll: (params: GetAllInvoicesQuery) =>
    axiosInstance
      .get<Result<PagedResult<InvoiceDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<InvoiceDto>>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateInvoicePayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then((r) => r.data),

  cancel: (id: number) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}/cancel`)
      .then((r) => r.data),

  createFromAppointment: (appointmentId: number | string) =>
    axiosInstance
      .post<Result<number>>(`${BASE}/from-appointment/${appointmentId}`)
      .then((r) => r.data),

  updateItems: (id: number | string, payload: UpdateInvoiceItemsPayload) =>
    axiosInstance
      .put<Result<object>>(`${BASE}/${id}/items`, payload)
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
      >(`${BASE}/${id}/pay`, { paymentMethod, paidAmount, note })
      .then((r) => r.data),
};
