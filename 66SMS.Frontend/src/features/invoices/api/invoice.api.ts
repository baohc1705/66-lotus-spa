import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result, PagedResult } from '@/shared/types/common.types'
import type { InvoiceDto, CreateInvoicePayload, GetAllInvoicesQuery } from '../types/invoice.types'

const BASE = API.invoices

export const invoiceApi = {
  // Danh sách hóa đơn (admin) — GET /Invoice/admin
  getAll: (params: GetAllInvoicesQuery) =>
    axiosInstance.get<Result<PagedResult<InvoiceDto>>>(`${BASE}/admin`, { params }).then(r => r.data),

  // Chi tiết hóa đơn — GET /Invoice/{id}
  getDetail: (id: number) =>
    axiosInstance.get<Result<InvoiceDto>>(`${BASE}/${id}`).then(r => r.data),

  // Lập hóa đơn (checkout) — POST /Invoice
  create: (payload: CreateInvoicePayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then(r => r.data),

  // Hủy hóa đơn — PATCH /Invoice/{id}/cancel
  cancel: (id: number) =>
    axiosInstance.patch<Result<object>>(`${BASE}/${id}/cancel`).then(r => r.data),

  // Tạo hóa đơn từ lịch hẹn — POST /Invoice/from-appointment/{appointmentId}
  createFromAppointment: (appointmentId: number | string) =>
    axiosInstance.post<Result<number>>(`${BASE}/from-appointment/${appointmentId}`).then(r => r.data),

  // Thanh toán hóa đơn — POST /Invoice/{id}/pay
  payInvoice: (id: number | string, paymentMethod: number, paidAmount: number, note?: string) =>
    axiosInstance.post<Result<object>>(`${BASE}/${id}/pay`, { paymentMethod, paidAmount, note }).then(r => r.data),
}
