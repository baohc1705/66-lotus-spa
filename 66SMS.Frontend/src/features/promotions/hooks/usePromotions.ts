import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { promotionApi } from '../api/promotion.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { PageRequest, Result } from '@/shared/types/common.types'
import type { CreatePromotionPayload, UpdatePromotionPayload } from '../types/promotion.types'

const PROMOTION_KEYS = {
  all: ['promotions'] as const,
  lists: () => [...PROMOTION_KEYS.all, 'list'] as const,
  list: (params: PageRequest) => [...PROMOTION_KEYS.lists(), params] as const,
  details: () => [...PROMOTION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROMOTION_KEYS.details(), id] as const,
}

export function usePromotions(params: PageRequest) {
  return useQuery({
    queryKey: PROMOTION_KEYS.list(params),
    queryFn: () => promotionApi.getAll(params),
  })
}

export function useCreatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) => promotionApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.lists() })
        toast.success('Tạo khuyến mãi thành công')
      } else {
        toast.error(result.message || 'Không thể tạo khuyến mãi')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePromotionPayload }) =>
      promotionApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.all })
        toast.success('Cập nhật khuyến mãi thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật khuyến mãi')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useDeletePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => promotionApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PROMOTION_KEYS.lists() })
        toast.success('Xóa khuyến mãi thành công')
      } else {
        toast.error(result.message || 'Không thể xóa khuyến mãi')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}
