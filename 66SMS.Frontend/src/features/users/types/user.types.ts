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
  loyaltyPoint?: number;
  firstPurchaseAt?: string;
  source?: string;
}

// Request payloads
export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface UpdateUserRequest {
  id?: number;
  username?: string;
  email?: string;
  isEmailConfirmed?: boolean;
  accessFailedCount?: number;
  status?: number;
  logoutEnd?: string;
}

export interface DeleteUserRequest {
  id?: number;
  ids?: number[];
}
