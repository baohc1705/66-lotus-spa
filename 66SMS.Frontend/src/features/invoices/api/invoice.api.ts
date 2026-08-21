import type {
  CreateInvoiceRequest,
  GetAllInvoiceQuery,
  InvoiceDto,
  UpdateInvoiceItemsRequest,
} from "@/features/invoices/types/invoice.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const invoiceApi = {
  // Query API
  getAll: async (
    params: GetAllInvoiceQuery,
  ): Promise<Result<PagedResult<InvoiceDto>>> => {
    const response = await axiosInstance.get<Result<PagedResult<InvoiceDto>>>(
      "/invoice/admin",
      { params },
    );
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<InvoiceDto>> => {
    const response = await axiosInstance.get<Result<InvoiceDto>>(`/invoice/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    payload: CreateInvoiceRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>("/invoice", payload);
    return response.data;
  },

  cancel: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/invoice/${id}/cancel`,
    );
    return response.data;
  },

  createFromAppointment: async (
    appointmentId: number | string,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      `/invoice/from-appointment/${appointmentId}`,
    );
    return response.data;
  },

  updateItems: async (
    id: number | string,
    payload: UpdateInvoiceItemsRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.put<Result<object>>(
      `/invoice/${id}/items`,
      payload,
    );
    return response.data;
  },

  payInvoice: async (
    id: number | string,
    paymentMethod: number,
    paidAmount: number,
    note: string,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      `/invoice/${id}/pay`,
      { paymentMethod, paidAmount, note },
    );
    return response.data;
  },
};
