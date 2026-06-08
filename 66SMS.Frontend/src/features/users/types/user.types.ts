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
