import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminWalletTransactions, addManualTransaction } from '../api/wallet.api';
import type { AdminWalletTransactionDto } from '../types/wallet.types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { FormField } from '@/shared/components/forms/FormField';
import { AdminInput } from '@/shared/components/forms/AdminInput';

interface WalletTransactionModalProps {
  walletId: number | null;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WalletTransactionModal({ walletId, customerName, isOpen, onClose }: WalletTransactionModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-wallet-transactions', walletId],
    queryFn: () => getAdminWalletTransactions(walletId!),
    enabled: !!walletId && isOpen,
  });

  const { mutate: addTransaction, isPending } = useMutation({
    mutationFn: (data: { amount: number; note: string }) => addManualTransaction(walletId!, data),
    onSuccess: () => {
      toast.success('Giao dịch thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions', walletId] });
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      setIsAdding(false);
      setAmount('');
      setNote('');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const transactions = response?.data || [];

  const handleAddSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const val = Number(amount.replace(/[^0-9-]/g, ''));
    if (!val || val === 0) {
      toast.error('Số tiền không hợp lệ');
      return;
    }
    addTransaction({ amount: val, note });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-stone-100 shrink-0">
          <DialogTitle className="text-lg font-bold text-lotus-deep">
            Chi tiết ví: {customerName}
          </DialogTitle>
          <p className="text-lotus-admin-md text-lotus-stone mt-0.5">
            Lịch sử giao dịch và biến động số dư của ví khách hàng.
          </p>
        </DialogHeader>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="mb-6 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lotus-deep text-lotus-admin-lg">Lịch sử giao dịch</h3>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant="admin"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nạp / Trừ tiền
            </Button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddSubmit} className="mb-6 p-4 border border-stone-200/50 rounded-xl bg-stone-50/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Số tiền (Âm để trừ tiền)">
                  <AdminInput
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="VD: 500000 hoặc -500000"
                    required
                  />
                </FormField>
                <FormField label="Ghi chú">
                  <AdminInput
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Lý do..."
                    required
                  />
                </FormField>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAdding(false)}
                  className="text-lotus-stone hover:bg-stone-100 text-lotus-admin-md h-9"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="admin"
                  disabled={isPending}
                  className="text-lotus-admin-md h-9 gap-1.5"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-lotus-rose" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
              <p className="text-lotus-stone text-lotus-admin-md">Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: AdminWalletTransactionDto) => {
                const isPositive = tx.amount > 0;
                
                const getTypeLabel = (type: number) => {
                  switch (type) {
                    case 1: return { label: "Hoàn tiền", className: "bg-indigo-50 text-indigo-700 border-indigo-200/50" };
                    case 2: return { label: "Thanh toán", className: "bg-sky-50 text-sky-700 border-sky-200/50" };
                    case 3: return { label: "Nạp tiền", className: "bg-emerald-50 text-emerald-700 border-emerald-200/50" };
                    case 4: return { label: "Thủ công", className: "bg-amber-50 text-amber-700 border-amber-200/50" };
                    default: return { label: "Khác", className: "bg-stone-50 text-stone-700 border-stone-200/50" };
                  }
                };

                const getStatusLabel = (status: number) => {
                  switch (status) {
                    case 1: return { label: "Thành công", className: "bg-green-50 text-green-700 border-green-200/50" };
                    case 2: return { label: "Thất bại", className: "bg-rose-50 text-rose-700 border-rose-200/50" };
                    case 3: return { label: "Đã đảo", className: "bg-stone-50 text-stone-700 border-stone-200/50" };
                    default: return { label: "Không rõ", className: "bg-stone-50 text-stone-700 border-stone-200/50" };
                  }
                };

                const typeInfo = getTypeLabel(tx.type);
                const statusInfo = getStatusLabel(tx.status);

                return (
                  <div key={tx.id} className="flex flex-col p-4 rounded-xl border border-stone-100 bg-white shadow-sm gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${
                          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-lotus-admin-xs font-mono font-bold text-stone-400">#{tx.id}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeInfo.className}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                            {tx.appointmentPaymentId && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-700 border-slate-200/50">
                                Thanh toán: #{tx.appointmentPaymentId}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-lotus-deep text-lotus-admin-md mt-1">{tx.note}</p>
                          <div className="flex items-center gap-2 mt-1 text-lotus-admin-xs text-lotus-stone">
                            <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span>Bởi: {tx.createdByName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-bold text-lotus-admin-lg ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-lotus-admin-xs text-lotus-stone mt-1">
                          Số dư sau: {formatCurrency(tx.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
