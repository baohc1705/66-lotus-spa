import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeeApi } from '../api/employee.api'
import type { PageRequest } from '@/shared/types/common.types'
import type { CreateEmployeePayload, UpdateEmployeePayload } from '../types/employee.types'

const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (params: PageRequest) => [...EMPLOYEE_KEYS.lists(), params] as const,
  details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
}

/** Hook lấy danh sách nhân viên (phân trang, search, sort) */
export function useEmployees(params: PageRequest) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: () => employeeApi.getAll(params),
  })
}

/** Hook lấy chi tiết nhân viên */
export function useEmployeeDetail(id: number | null) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id!),
    queryFn: () => employeeApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

/** Hook tạo nhân viên mới */
export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() })
        toast.success('Tạo nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể tạo nhân viên')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo nhân viên'),
  })
}

/** Hook cập nhật nhân viên */
export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) =>
      employeeApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all })
        toast.success('Cập nhật nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật nhân viên')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật nhân viên'),
  })
}

/** Hook xóa nhân viên */
export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() })
        toast.success('Xóa nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể xóa nhân viên')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi xóa nhân viên'),
  })
}
