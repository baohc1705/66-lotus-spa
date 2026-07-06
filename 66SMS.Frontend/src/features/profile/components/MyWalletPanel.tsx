import { formatCurrency } from '@/shared/utils/currency';
import { useQuery } from '@tanstack/react-query'
import { getMyWallet, getMyWalletTransactions } from '../../wallet/api/wallet.api'
import type { WalletTransactionDto } from '../../wallet/types/wallet.types'
import { Loader2, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'

export function MyWalletPanel() {
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['my-wallet'],
    queryFn: getMyWallet,
  })

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['my-wallet-transactions'],
    queryFn: getMyWalletTransactions,
  })

  if (isLoadingWallet || isLoadingTransactions) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lotus-rose" />
      </div>
    )
  }

  const balance = walletData?.data?.balance ?? 0
  const transactions = transactionsData?.data ?? []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-lotus-deep mb-2">Ví của tôi</h2>
        <p className="text-lotus-stone text-sm">
          Quản lý số dư và lịch sử giao dịch từ việc hoàn/hủy lịch hẹn.
        </p>
      </div>

      <div className="bg-gradient-to-br from-lotus-rose to-lotus-gold rounded-3xl p-8 text-white shadow-xl shadow-lotus-rose/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3 opacity-90 mb-6">
            <Wallet className="w-6 h-6" />
            <span className="font-medium text-lg">Số dư hiện tại</span>
          </div>
          <div className="text-4xl md:text-5xl font-bold tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-lotus-deep mb-4">Lịch sử giao dịch</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-lotus-cream/50 rounded-2xl border border-lotus-rose-light border-dashed">
            <p className="text-lotus-stone">Chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: WalletTransactionDto) => {
              const amount = Number(tx.amount) || 0
              const isPositive = amount > 0
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-lotus-rose-light transition-colors bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-lotus-deep">{tx.note || (isPositive ? 'Hoàn tiền ví' : 'Thanh toán cọc')}</p>
                      <p className="text-xs text-lotus-stone mt-0.5">
                        {new Date(tx.createdAt || '').toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
