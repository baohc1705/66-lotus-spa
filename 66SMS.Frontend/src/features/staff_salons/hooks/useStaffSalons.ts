import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffSalonApi, meApi, type AssignManagerPayload } from '../api/staff-salon.api'
import type {
  StaffSalonQueryParams,
  CreateStaffSalonPayload,
  UpdateStaffSalonPayload,
} from '../types/staff-salon.types'

const STAFF_SALON_KEYS = {
  all: ['staff-salons'] as const,
  lists: () => [...STAFF_SALON_KEYS.all, 'list'] as const,
  list: (params: StaffSalonQueryParams) => [...STAFF_SALON_KEYS.lists(), params] as const,
  details: () => [...STAFF_SALON_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...STAFF_SALON_KEYS.details(), id] as const,
}

export function useStaffSalons(params: StaffSalonQueryParams) {
  return useQuery({
    queryKey: STAFF_SALON_KEYS.list(params),
    queryFn: () => staffSalonApi.getAll(params),
  })
}

export function useStaffSalonDetail(id: number | null) {
  return useQuery({
    queryKey: STAFF_SALON_KEYS.detail(id!),
    queryFn: () => staffSalonApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateStaffSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffSalonPayload) => staffSalonApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.lists() })
        toast.success('Gán nhân viên vào chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi gán nhân viên'),
  })
}

export function useUpdateStaffSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffSalonPayload }) =>
      staffSalonApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all })
        toast.success('Cập nhật nhân viên chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật'),
  })
}

export function useDeleteStaffSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => staffSalonApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all })
        toast.success('Xóa nhân viên khỏi chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi xóa nhân viên'),
  })
}

export function useAssignManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignManagerPayload) => staffSalonApi.assignManager(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all })
        toast.success('Phân công quản lý thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi phân công quản lý'),
  })
}

export function useRemoveManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignManagerPayload) => staffSalonApi.removeManager(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all })
        toast.success('Gỡ quản lý thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi gỡ quản lý'),
  })
}

export function useMySalon() {
  return useQuery({
    queryKey: ['me', 'salon'],
    queryFn: () => meApi.getMySalon(),
    staleTime: 5 * 60 * 1000,
  })
}
