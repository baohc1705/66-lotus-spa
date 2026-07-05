export interface UserDto {
  id: number;
  username: string;
  email: string;
  isEmailConfirmed: boolean;
  status: string;
  logoutEnd?: string;
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
  source?: string;
}

export type {
  CreateUserPayload,
  UpdateUserPayload,
  UserFormValues,
} from "../schemas/user.schema";

