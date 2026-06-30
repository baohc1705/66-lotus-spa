import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { treatmentCourseApi } from '../api/treatmentCourse.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { PageRequest, Result } from '@/shared/types/common.types'
import type { CreateTreatmentCoursePayload, UpdateTreatmentCoursePayload } from '../types/treatmentCourse.types'

const KEYS = {
  all: ['treatment-courses'] as const,
  lists: () => [...KEYS.all, 'list'] as const,
  list: (params: PageRequest) => [...KEYS.lists(), params] as const,
  details: () => [...KEYS.all, 'detail'] as const,
  detail: (id: number) => [...KEYS.details(), id] as const,
}

export function useTreatmentCourses(params: PageRequest) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => treatmentCourseApi.getAll(params),
  })
}

export function useTreatmentCourseDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => treatmentCourseApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateTreatmentCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTreatmentCoursePayload) => treatmentCourseApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() })
        toast.success('Tạo liệu trình thành công')
      } else {
        toast.error(result.message || 'Không thể tạo liệu trình')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateTreatmentCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTreatmentCoursePayload }) =>
      treatmentCourseApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all })
        toast.success('Cập nhật liệu trình thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật liệu trình')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteTreatmentCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => treatmentCourseApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() })
        toast.success('Xóa liệu trình thành công')
      } else {
        toast.error(result.message || 'Không thể xóa liệu trình')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}
