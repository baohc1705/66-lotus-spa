import { formatCurrency } from '@/shared/utils/currency';
import { formatDateTimeDisplay } from '@/shared/utils/date.utils';
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
      <div className="py-10 flex justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-lotus-rose" />
      </div>
    )
  }

  const balance = walletData?.data?.balance ?? 0
  const transactions = transactionsData?.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-lotus-deep mb-1">Ví của tôi</h2>
        <p className="text-lotus-stone text-sm">
          Quản lý số dư và lịch sử giao dịch từ việc hoàn/hủy lịch hẹn.
        </p>
      </div>

      <div className="bg-gradient-to-br from-lotus-rose to-lotus-gold rounded-xl p-5 text-white shadow-md shadow-lotus-rose/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 opacity-90 mb-3">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Số dư hiện tại</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-lotus-deep mb-3">Lịch sử giao dịch</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-6 bg-lotus-cream/50 rounded-xl">
            <p className="text-lotus-stone text-sm">Chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: WalletTransactionDto) => {
              const amount = Number(tx.amount) || 0
              const isPositive = amount > 0
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-lotus-cream/50 hover:bg-lotus-cream transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-success-bg text-success-text' : 'bg-rose-100 text-rose-600'}`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-lotus-deep">{tx.note || (isPositive ? 'Hoàn tiền ví' : 'Thanh toán cọc')}</p>
                      <p className="text-xs text-lotus-stone mt-0.5">
                        {formatDateTimeDisplay(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${isPositive ? 'text-success-text' : 'text-rose-600'}`}>
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
