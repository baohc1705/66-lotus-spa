import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";

export interface AdminWalletDto {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerAvatar: string | null;
  balance: number;
  status: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminWalletTransactionDto {
  id: number;
  walletId: number;
  appointmentPaymentId: number | null;
  amount: number;
  balanceAfter: number;
  type: number;
  note: string;
  status: number;
  createdAt: string;
  createdBy: number | null;
  createdByName: string;
}

export const getAdminWallets = async () => {
  const response = await axiosInstance.get<Result<AdminWalletDto[]>>(API.admin.wallets);
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
