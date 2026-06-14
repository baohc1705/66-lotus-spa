import { useState } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, Plus, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminWalletTransactions, addManualTransaction } from '../api/wallet.api'
import type { AdminWalletTransactionDto } from '../types/wallet.types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

interface WalletTransactionModalProps {
  walletId: number | null
  customerName: string
  isOpen: boolean
  onClose: () => void
}

export function WalletTransactionModal({ walletId, customerName, isOpen, onClose }: WalletTransactionModalProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const queryClient = useQueryClient()

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-wallet-transactions', walletId],
    queryFn: () => getAdminWalletTransactions(walletId!),
    enabled: !!walletId && isOpen,
  })

  const { mutate: addTransaction, isPending } = useMutation({
    mutationFn: (data: { amount: number; note: string }) => addManualTransaction(walletId!, data),
    onSuccess: () => {
      toast.success('Giao dịch thành công')
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions', walletId] })
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] })
      setIsAdding(false)
      setAmount('')
      setNote('')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  if (!isOpen) return null

  const transactions = response?.data || []

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(amount.replace(/[^0-9-]/g, ''))
    if (!val || val === 0) {
      toast.error('Số tiền không hợp lệ')
      return
    }
    addTransaction({ amount: val, note })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Chi tiết ví: {customerName}</h2>
            <p className="text-sm text-gray-500">Lịch sử giao dịch và biến động số dư</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Lịch sử giao dịch</h3>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-lotus-leaf rounded-lg hover:bg-lotus-leaf/90"
            >
              <Plus className="w-4 h-4" /> Nạp / Trừ tiền
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddSubmit} className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền (Âm để trừ tiền)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="VD: 500000 hoặc -500000"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-lotus-leaf focus:border-lotus-leaf"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Lý do..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-lotus-leaf focus:border-lotus-leaf"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-lotus-leaf hover:bg-lotus-leaf/90 rounded-lg flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-lotus-rose" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm">Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: AdminWalletTransactionDto) => {
                const isPositive = tx.amount > 0
                return (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0", isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600')}>
                        {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{tx.note}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>Bởi: {tx.createdByName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-bold text-sm", isPositive ? 'text-emerald-600' : 'text-rose-600')}>
                        {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Số dư sau: {formatCurrency(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
