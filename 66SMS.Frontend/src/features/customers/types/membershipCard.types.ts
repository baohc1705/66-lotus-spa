import type { PageRequest } from '@/shared/types/common.types'

export interface MembershipCardDto {
  id: number
  customerId: number
  customerName: string | null
  membershipTierId: number | null
  tierName: string | null
  cardCode: string
  issuedAt: string | null
  expiresAt: string | null
  status: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface UpdateMembershipCardPayload {
  customerId?: number
  membershipTierId?: number
  cardCode?: string
  issuedAt?: string
  expiresAt?: string
  status?: number
}

export interface MembershipCardQueryParams extends PageRequest {
  customerId?: number
  membershipTierId?: number
  keyword?: string
  status?: number
}
