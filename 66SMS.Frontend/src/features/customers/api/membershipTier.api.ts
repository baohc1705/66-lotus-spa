import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result, PagedResult } from '@/shared/types/common.types'
import type {
  MembershipTierDto,
  CreateMembershipTierPayload,
  UpdateMembershipTierPayload,
  MembershipTierQueryParams,
} from '../types/membershipTier.types'

const BASE = API.membershipTiers

export const membershipTierApi = {
  getAll: (params: MembershipTierQueryParams) =>
    axiosInstance.get<Result<PagedResult<MembershipTierDto>>>(BASE, { params }).then(r => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<MembershipTierDto>>(`${BASE}/${id}`).then(r => r.data),

  create: (payload: CreateMembershipTierPayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then(r => r.data),

  update: (id: number, payload: UpdateMembershipTierPayload) =>
    axiosInstance.patch<Result<object>>(`${BASE}/${id}`, payload).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then(r => r.data),
}
