import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { membershipTierApi } from '../api/membershipTier.api'
import type { CreateMembershipTierPayload, UpdateMembershipTierPayload, MembershipTierQueryParams } from '../types/membershipTier.types'

const TIER_KEYS = {
  all: ['membershipTiers'] as const,
  lists: () => [...TIER_KEYS.all, 'list'] as const,
  list: (params: MembershipTierQueryParams) => [...TIER_KEYS.lists(), params] as const,
  details: () => [...TIER_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TIER_KEYS.details(), id] as const,
}

export function useMembershipTiers(params: MembershipTierQueryParams) {
  return useQuery({
    queryKey: TIER_KEYS.list(params),
    queryFn: () => membershipTierApi.getAll(params),
  })
}

export function useMembershipTierDetail(id: number | null) {
  return useQuery({
    queryKey: TIER_KEYS.detail(id!),
    queryFn: () => membershipTierApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateMembershipTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMembershipTierPayload) => membershipTierApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.lists() })
        toast.success('Tạo loại thẻ thành công')
      } else {
        toast.error(result.message || 'Không thể tạo loại thẻ')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo loại thẻ'),
  })
}

export function useUpdateMembershipTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMembershipTierPayload }) =>
      membershipTierApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.all })
        toast.success('Cập nhật loại thẻ thành công')
      } else {
        toast.error(result.message || 'Không thể cập nhật loại thẻ')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi cập nhật loại thẻ'),
  })
}

export function useDeleteMembershipTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => membershipTierApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIER_KEYS.lists() })
        toast.success('Xóa loại thẻ thành công')
      } else {
        toast.error(result.message || 'Không thể xóa loại thẻ')
      }
    },
    onError: () => toast.error('Có lỗi xảy ra khi xóa loại thẻ'),
  })
}
