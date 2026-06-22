import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { staffApi } from '../api/staff.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { PageRequest, Result } from '@/shared/types/common.types'
import type { CreateStaffPayload, UpdateStaffPayload } from '../types/staff.types'

const STAFF_KEYS = {
  all: ['staffs'] as const,
  lists: () => [...STAFF_KEYS.all, 'list'] as const,
  list: (params: PageRequest & { salonId?: number | null }) => [...STAFF_KEYS.lists(), params] as const,
  details: () => [...STAFF_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...STAFF_KEYS.details(), id] as const,
}

/** Hook lấy danh sách nhân viên (phân trang, search, sort) */
export function useStaffs(params: PageRequest & { salonId?: number | null }) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => staffApi.getAll(params),
  })
}

export function useAdminStaffs(params: PageRequest & { salonId?: number | null }) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => staffApi.adminGetAll(params),
  })
}


/** Hook lấy chi tiết nhân viên */
export function useStaffDetail(id: number | null) {
  return useQuery({
    queryKey: STAFF_KEYS.detail(id!),
    queryFn: () => staffApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

/** Hook tạo nhân viên mới */
export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.lists() })
        toast.success('Tạo nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể tạo nhân viên')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

/** Hook cập nhật nhân viên */
export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffPayload }) =>
      staffApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.all })
        toast.success('Cập nhật nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật nhân viên')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

/** Hook xóa nhân viên */
export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_KEYS.lists() })
        toast.success('Xóa nhân viên thành công')
      } else {
        toast.error(result.message || 'Không thể xóa nhân viên')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}
