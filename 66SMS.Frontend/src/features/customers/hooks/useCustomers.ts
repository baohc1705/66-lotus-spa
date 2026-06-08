import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerApi } from '../api/customer.api'
import type { PageRequest } from '@/shared/types/common.types'
import type { CreateCustomerPayload, UpdateCustomerPayload } from '../types/customer.types'

const CUSTOMER_KEYS = {
  all: ['customers'] as const,
  lists: () => [...CUSTOMER_KEYS.all, 'list'] as const,
  list: (params: PageRequest) => [...CUSTOMER_KEYS.lists(), params] as const,
  details: () => [...CUSTOMER_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CUSTOMER_KEYS.details(), id] as const,
}

/** Hook lấy danh sách khách hàng (phân trang, search, sort) */
export function useCustomers(params: PageRequest) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(params),
    queryFn: () => customerApi.getAll(params),
  })
}

/** Hook lấy chi tiết khách hàng */
export function useCustomerDetail(id: number | null) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id!),
    queryFn: () => customerApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

/** Hook tạo khách hàng mới */
export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customerApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.lists() })
        toast.success('Tạo khách hàng thành công')
      } else {
        toast.error(result.message || 'Không thể tạo khách hàng')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo khách hàng'),
  })
}

/** Hook cập nhật khách hàng */
export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCustomerPayload }) =>
      customerApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.all })
        toast.success('Cập nhật khách hàng thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật khách hàng')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật khách hàng'),
  })
}

/** Hook xóa khách hàng */
export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.lists() })
        toast.success('Xóa khách hàng thành công')
      } else {
        toast.error(result.message || 'Không thể xóa khách hàng')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi xóa khách hàng'),
  })
}
