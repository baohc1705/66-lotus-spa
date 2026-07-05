import type { PageRequest } from "@/shared/types/common.types";

export interface MembershipTierDto {
  id: number;
  name: string;
  minSpending: number;
  discountPercent: number;
  pointMultiplier: number;
  benefits: string | null;
  status: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MembershipTierQueryParams extends PageRequest {
  keyword?: string;
}

export type {
  CreateMembershipTierPayload,
  UpdateMembershipTierPayload,
  MembershipTierFormValues,
} from "../schemas/membershipTier.schema";
