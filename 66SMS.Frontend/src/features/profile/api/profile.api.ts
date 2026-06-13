import axiosInstance from '@/shared/api/axiosInstance'
import type { Result } from '@/shared/types/common.types'
import type { ProfileResponse, UpdateProfileRequest, ChangePasswordRequest, WalletTransactionDto } from '../types/profile.types'

export const profileApi = {
  getProfile: async () => {
    const { data } = await axiosInstance.get<Result<ProfileResponse>>('/users/me')
    return data
  },

  updateProfile: async (body: UpdateProfileRequest) => {
    const { data } = await axiosInstance.put<Result<void>>('/users/me', body)
    return data
  },

  changePassword: async (body: ChangePasswordRequest) => {
    const { data } = await axiosInstance.post<Result<void>>('/auth/change-password', body)
    return data
  },
}

export const getMyWallet = async () => {
  return {
    data: { balance: 0 },
    isSuccess: true,
    message: 'Success',
    code: 200
  } as Result<{ balance: number }>
}

export const getMyWalletTransactions = async () => {
  return {
    data: [],
    isSuccess: true,
    message: 'Success',
    code: 200
  } as unknown as Result<WalletTransactionDto[]>
}
