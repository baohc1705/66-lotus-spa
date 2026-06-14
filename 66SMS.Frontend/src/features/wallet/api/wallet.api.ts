import axiosInstance from '@/shared/api/axiosInstance'
import type { Result } from '@/shared/types/common.types'
import type { AdminWalletDto, AdminWalletTransactionDto, WalletTransactionDto } from '../types/wallet.types'

export const getAdminWallets = async () => {
  const response = await axiosInstance.get<Result<AdminWalletDto[]>>('/admin/wallets')
  return response.data
}

export const getAdminWalletTransactions = async (walletId: number) => {
  const response = await axiosInstance.get<Result<AdminWalletTransactionDto[]>>(`/admin/wallets/${walletId}/transactions`)
  return response.data
}

export const addManualTransaction = async (walletId: number, data: { amount: number; note: string }) => {
  const response = await axiosInstance.post<Result<object>>(`/admin/wallets/${walletId}/transaction`, data)
  return response.data
}

export const getMyWallet = async () => {
  const { data } = await axiosInstance.get<Result<{ balance: number }>>('/users/me/wallet')
  return data
}

export const getMyWalletTransactions = async () => {
  const { data } = await axiosInstance.get<Result<WalletTransactionDto[]>>('/users/me/wallet/transactions')
  return data
}
