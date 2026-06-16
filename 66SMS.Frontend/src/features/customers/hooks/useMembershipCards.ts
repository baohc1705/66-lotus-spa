import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { membershipCardApi } from '../api/membershipCard.api'
import type { UpdateMembershipCardPayload, MembershipCardQueryParams } from '../types/membershipCard.types'

const CARD_KEYS = {
  all: ['membershipCards'] as const,
  lists: () => [...CARD_KEYS.all, 'list'] as const,
  list: (params: MembershipCardQueryParams) => [...CARD_KEYS.lists(), params] as const,
  details: () => [...CARD_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CARD_KEYS.details(), id] as const,
}

export function useMembershipCards(params: MembershipCardQueryParams) {
  return useQuery({
    queryKey: CARD_KEYS.list(params),
    queryFn: () => membershipCardApi.getAll(params),
  })
}

export function useMembershipCardDetail(id: number | null) {
  return useQuery({
    queryKey: CARD_KEYS.detail(id!),
    queryFn: () => membershipCardApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useUpdateMembershipCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMembershipCardPayload }) =>
      membershipCardApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CARD_KEYS.all })
        toast.success('Cập nhật thẻ thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật thẻ')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật thẻ'),
  })
}
