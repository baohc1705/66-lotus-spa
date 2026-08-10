import axiosInstance from "@/shared/api/axiosInstance";
import type { PageRequest, PagedResult, Result } from "@/shared/types/common.types";
import type {
  AdminWalletDto,
  AdminWalletTransactionDto,
  WalletTransactionDto,
} from "../types/wallet.types";

export const getAdminWallets = async (
  params: PageRequest & { customerId?: number | null },
) => {
  const response = await axiosInstance.get<Result<PagedResult<AdminWalletDto>>>(
    "/admin/wallets",
    { params },
  );
  return response.data;
};

export const getAdminWalletTransactions = async (walletId: number) => {
  const response = await axiosInstance.get<Result<AdminWalletTransactionDto[]>>(
    `/admin/wallets/${walletId}/transactions`,
  );
  return response.data;
};

export const addManualTransaction = async (
  walletId: number,
  data: { amount: number; note: string },
) => {
  const response = await axiosInstance.post<Result<object>>(
    `/admin/wallets/${walletId}/transaction`,
    data,
  );
  return response.data;
};

export const getMyWallet = async () => {
  const { data } = await axiosInstance.get<Result<{ balance: number }>>(
    "/users/me/wallet",
  );
  return data;
};

export const getMyWalletTransactions = async () => {
  const { data } = await axiosInstance.get<Result<WalletTransactionDto[]>>(
    "/users/me/wallet/transactions",
  );
  return data;
};

export const getWalletTopUpVnPayUrl = async (
  amount: number,
): Promise<string> => {
  const { data } = await axiosInstance.get<Result<string>>(
    "/users/me/wallet/top-up-vnpay-url",
    {
      params: { amount },
    },
  );
  return data.data || "";
};
