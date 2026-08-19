import type { PageRequest } from "@/shared/types/common.types";

export interface CustomerDto {
  id?: number;
  userId?: number;
  fullName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: number;
  phone?: string;
  loyaltyPoint?: number;
  firstPurchaseAt?: string;
  lastPurchaseAt?: string;
  source?: string;
  status?: number;
  note?: string;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
  email?: string;
  membershipTier?: string;
}

export interface GetAllCustomerQuery extends PageRequest {
  status?: number;
  gender?: number;
  source?: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  imageBase64?: string;
  dateOfBirth?: string;
  gender?: number;
  loyaltyPoint?: number;
  source?: string;
  status?: number;
  note?: string;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  avatarUrl?: string;
  imageBase64?: string;
  dateOfBirth?: string;
  gender?: number;
  phone?: string;
  loyaltyPoint?: number;
  source?: string;
  status?: number;
  note?: string;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
}
