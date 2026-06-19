import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types'
import type { CustomerDto, CreateCustomerPayload, UpdateCustomerPayload } from '../types/customer.types'

const BASE = API.customers

export const customerApi = {
  /** GET /customer — Danh sách khách hàng (phân trang) — quyền: customers.read, role: admin */
  getAll: (params: PageRequest) =>
    axiosInstance.get<Result<PagedResult<CustomerDto>>>(BASE, { params }).then(r => r.data),

  /** GET /customer/:id — Chi tiết khách hàng — quyền: customers.read */
  getDetail: (id: number) =>
    axiosInstance.get<Result<CustomerDto>>(`${BASE}/${id}`).then(r => r.data),

  /** POST /customer — Tạo khách hàng — [AllowAnonymous] */
  create: (payload: CreateCustomerPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then(r => r.data),

  /** PATCH /customer/:id — Cập nhật khách hàng — quyền: customers.update */
  update: (id: number, payload: UpdateCustomerPayload) =>
    axiosInstance.patch<Result<object>>(`${BASE}/${id}`, payload).then(r => r.data),

  /** DELETE /customer/:id — Xóa khách hàng — quyền: customers.delete, role: admin */
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then(r => r.data),
}
