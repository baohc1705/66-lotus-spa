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

export interface WalletTransactionDto {
  id: string | number;
  amount: number;
  type?: number;
  note?: string;
  createdAt: string;
}
