import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";
import type {
  AdminWalletDto,
  AdminWalletTransactionDto,
  WalletTransactionDto,
} from "../types/wallet.types";

export const getAdminWallets = async () => {
  const response = await axiosInstance.get<Result<AdminWalletDto[]>>(
    API.admin.wallets,
  );
  return response.data;
};

export const getAdminWalletTransactions = async (walletId: number) => {
  const response = await axiosInstance.get<Result<AdminWalletTransactionDto[]>>(
    `${API.admin.wallets}/${walletId}/transactions`,
  );
  return response.data;
};

export const addManualTransaction = async (
  walletId: number,
  data: { amount: number; note: string },
) => {
  const response = await axiosInstance.post<Result<object>>(
    `${API.admin.wallets}/${walletId}/transaction`,
    data,
  );
  return response.data;
};

export const getMyWallet = async () => {
  const { data } = await axiosInstance.get<Result<{ balance: number }>>(
    API.users.meWallet,
  );
  return data;
};

export const getMyWalletTransactions = async () => {
  const { data } = await axiosInstance.get<Result<WalletTransactionDto[]>>(
    API.users.meWalletTx,
  );
  return data;
};

export const getWalletTopUpVnPayUrl = async (
  amount: number,
): Promise<string> => {
  const { data } = await axiosInstance.get<Result<string>>(
    API.users.meWalletTopUpVnPayUrl,
    {
      params: { amount },
    },
  );
  return data.data || "";
};
