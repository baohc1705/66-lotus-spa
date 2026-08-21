import type { PageRequest } from "@/shared/types/common.types";

export interface MembershipCardDto {
  id?: number;
  customerId?: number;
  customerName?: string;
  membershipTierId?: number;
  tierName?: string;
  cardCode?: string;
  issuedAt?: string;
  expiresAt?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllMembershipCardQuery extends PageRequest {
  customerId?: number;
  membershipTierId?: number;
  status?: number;
}

export interface CreateMembershipCardRequest {
  customerId: number;
  membershipTierId?: number;
  membershipTierName?: string;
  cardCode: string;
  issuedAt?: string;
  expiresAt?: string;
  status?: number;
  createdAt?: string;
}

export interface UpdateMembershipCardRequest {
  customerId?: number;
  membershipTierId?: number;
  cardCode?: string;
  issuedAt?: string;
  expiresAt?: string;
  status?: number;
}
