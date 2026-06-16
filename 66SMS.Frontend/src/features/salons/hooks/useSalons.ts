import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { salonApi } from '../api/salon.api'
import type { SalonQueryParams } from '../types/salon.types'
import type { CreateSalonPayload, UpdateSalonPayload } from '../types/salon.types'

const SALON_KEYS = {
  all: ['salons'] as const,
  lists: () => [...SALON_KEYS.all, 'list'] as const,
  list: (params: SalonQueryParams) => [...SALON_KEYS.lists(), params] as const,
  details: () => [...SALON_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SALON_KEYS.details(), id] as const,
}

export function useSalons(params: SalonQueryParams) {
  return useQuery({
    queryKey: SALON_KEYS.list(params),
    queryFn: () => salonApi.getAll(params),
  })
}

export function useSalonDetail(id: number | null) {
  return useQuery({
    queryKey: SALON_KEYS.detail(id!),
    queryFn: () => salonApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSalonPayload) => salonApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.lists() })
        toast.success('Tạo chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo chi nhánh'),
  })
}

export function useUpdateSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSalonPayload }) =>
      salonApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all })
        toast.success('Cập nhật chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật chi nhánh'),
  })
}

export function useDeleteSalon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => salonApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all })
        toast.success('Xóa chi nhánh thành công')
      } else {
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi xóa chi nhánh'),
  })
}
