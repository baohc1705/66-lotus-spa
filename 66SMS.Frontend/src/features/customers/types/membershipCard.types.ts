import type { PageRequest } from "@/shared/types/common.types";

export interface MembershipCardDto {
  id: number;
  customerId: number;
  customerName: string | null;
  membershipTierId: number | null;
  tierName: string | null;
  cardCode: string;
  issuedAt: string | null;
  expiresAt: string | null;
  status: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MembershipCardQueryParams extends PageRequest {
  customerId?: number;
  membershipTierId?: number;
  keyword?: string;
  status?: number;
}

export type {
  UpdateMembershipCardPayload,
  MembershipCardFormValues,
} from "../schemas/membershipCard.schema";
