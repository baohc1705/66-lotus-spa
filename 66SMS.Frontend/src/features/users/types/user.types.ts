export interface UserDto {
  id: number;
  username: string;
  email: string;
  isEmailConfirmed: boolean;
  status: string;
  lockoutEnd?: string;
  lastLoginAt?: string;
  roles?: string[];
  permissions?: string[];

  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  gender?: number;
  dateOfBirth?: string;

  profileType?: string;

  staffInfo?: StaffProfileDto;
  customerInfo?: CustomerProfileDto;
}

export interface StaffProfileDto {
  id?: number;
  code?: string;
  nationalId?: string;
  hireDate?: string;
  contractType?: string;
}

export interface CustomerProfileDto {
  id?: number;
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
}

export interface UserAccountDto {
  username: string;
  email: string;
  role?: string;
  isEmailConfirmed: boolean;
  accessFailedCount: number;
  status: string | number;
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: number;
  updatedAt?: string;
}

export type {
  CreateUserPayload,
  UpdateUserPayload,
  UserFormValues,
} from "../schemas/user.schema";
