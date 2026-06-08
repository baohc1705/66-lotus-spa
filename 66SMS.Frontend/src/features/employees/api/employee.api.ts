import axiosInstance from '@/shared/api/axiosInstance'
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types'
import type { EmployeeDto, CreateEmployeePayload, UpdateEmployeePayload } from '../types/employee.types'

const BASE = '/employee'

export const employeeApi = {
  /** GET /employee — Danh sách nhân viên (phân trang) — quyền: employees.read, role: admin */
  getAll: (params: PageRequest) =>
    axiosInstance.get<Result<PagedResult<EmployeeDto>>>(BASE, { params }).then(r => r.data),

  /** GET /employee/:id — Chi tiết nhân viên — quyền: employees.read */
  getDetail: (id: number) =>
    axiosInstance.get<Result<EmployeeDto>>(`${BASE}/${id}`).then(r => r.data),

  /** POST /employee — Tạo nhân viên — quyền: employees.create, role: admin */
  create: (payload: CreateEmployeePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then(r => r.data),

  /** PATCH /employee/:id — Cập nhật nhân viên — quyền: employees.update */
  update: (id: number, payload: UpdateEmployeePayload) =>
    axiosInstance.patch<Result<object>>(`${BASE}/${id}`, payload).then(r => r.data),

  /** DELETE /employee/:id — Xóa nhân viên — quyền: employees.delete, role: admin */
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then(r => r.data),
}
