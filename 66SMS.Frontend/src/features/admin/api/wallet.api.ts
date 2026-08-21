import type {
  AdminWalletDto,
  AdminWalletTransactionDto,
} from "@/features/admin/types/adminWallet.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";

export const adminWalletApi = {
  // Query API
  getAll: async (): Promise<Result<AdminWalletDto[]>> => {
    const response = await axiosInstance.get<Result<AdminWalletDto[]>>("/admin/wallets");
    return response.data;
  },

  getTransactions: async (walletId: number): Promise<Result<AdminWalletTransactionDto[]>> => {
    const response = await axiosInstance.get<Result<AdminWalletTransactionDto[]>>(
      `/admin/wallets/${walletId}/transactions`,
    );
    return response.data;
  },

  // Command API
  addTransaction: async (walletId: number, data: { amount: number; note: string }): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      `/admin/wallets/${walletId}/transaction`,
      data,
    );
    return response.data;
  },
};
