import { useQuery } from '@tanstack/react-query'
import { getMyWallet, getMyWalletTransactions } from '../api/profile.api'
import type { WalletTransactionDto } from '../types/profile.types'
import { Loader2, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

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
        <Loader2 className="w-8 h-8 animate-spin text-[var(--spa-rose)]" />
      </div>
    )
  }

  const balance = walletData?.data?.balance ?? 0
  const transactions = transactionsData?.data ?? []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--spa-text)] mb-2">Ví của tôi</h2>
        <p className="text-[var(--spa-text-muted)] text-sm">
          Quản lý số dư và lịch sử giao dịch từ việc hoàn/hủy lịch hẹn.
        </p>
      </div>

      <div className="bg-gradient-to-br from-[var(--spa-rose)] to-[var(--spa-gold)] rounded-3xl p-8 text-white shadow-xl shadow-[var(--spa-rose)]/20 relative overflow-hidden">
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
        <h3 className="text-lg font-bold text-[var(--spa-text)] mb-4">Lịch sử giao dịch</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-[var(--spa-cream)]/50 rounded-2xl border border-[var(--spa-border)] border-dashed">
            <p className="text-[var(--spa-text-muted)]">Chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: WalletTransactionDto) => {
              const amount = Number(tx.amount) || 0
              const isPositive = amount > 0
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--spa-border)] hover:border-[var(--spa-rose-light)] transition-colors bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--spa-text)]">{tx.note || (isPositive ? 'Hoàn tiền ví' : 'Thanh toán cọc')}</p>
                      <p className="text-xs text-[var(--spa-text-muted)] mt-0.5">
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
