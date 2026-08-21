import type { PageRequest } from "@/shared/types/common.types";

export interface MembershipTierDto {
  id?: number;
  code?: string;
  name?: string;
  minSpending?: number;
  discountPercent?: number;
  pointMultiplier?: number;
  benefits?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllMembershipTierQuery extends PageRequest {
  keyword?: string;
}

export interface CreateMembershipTierRequest {
  code?: string;
  name: string;
  minSpending: number;
  discountPercent?: number;
  pointMultiplier: number;
  benefits?: string;
  status: number;
}

export interface UpdateMembershipTierRequest {
  code?: string;
  name?: string;
  minSpending?: number;
  discountPercent?: number;
  pointMultiplier?: number;
  benefits?: string;
  status?: number;
}
