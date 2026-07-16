import { useState } from 'react'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDateTimeDisplay } from '@/shared/utils/date.utils'
import { useQuery } from '@tanstack/react-query'
import { getMyWallet, getMyWalletTransactions, getWalletTopUpVnPayUrl } from '../../wallet/api/wallet.api'
import type { WalletTransactionDto } from '../../wallet/types/wallet.types'
import { Loader2, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { Result } from '@/shared/types/common.types'

const MIN_TOP_UP = 10000
const MAX_TOP_UP = 50000000

export function MyWalletPanel() {
  const [amountInput, setAmountInput] = useState('')
  const [isToppingUp, setIsToppingUp] = useState(false)

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

  const handleTopUp = async () => {
    const amount = Number(amountInput.replace(/\D/g, ''))
    if (!amount || amount < MIN_TOP_UP || amount > MAX_TOP_UP) {
      toast.error('Số tiền nạp phải từ 10.000đ đến 50.000.000đ.')
      return
    }

    setIsToppingUp(true)
    try {
      const url = await getWalletTopUpVnPayUrl(amount)
      if (url) {
        window.location.assign(url)
        return
      }
      toast.error('Không tạo được liên kết thanh toán. Vui lòng thử lại.')
    } catch (error) {
      const axiosError = error as AxiosError<Result<unknown>>
      const msg = axiosError.response?.data?.message ?? 'Không thể kết nối đến máy chủ'
      toast.error(msg)
    } finally {
      setIsToppingUp(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-lotus-deep mb-1">Ví của tôi</h2>
        <p className="text-lotus-stone text-sm">
          Quản lý số dư, nạp tiền qua VNPay và xem lịch sử hoàn/hủy lịch hẹn.
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

      <div className="rounded-xl border border-lotus-cream bg-white p-4 space-y-3">
        <h3 className="text-base font-bold text-lotus-deep">Nạp tiền vào ví</h3>
        <p className="text-xs text-lotus-stone">
          Nhập số tiền (tối thiểu 10.000đ), sau đó thanh toán qua VNPay.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={amountInput}
            onChange={(e: { target: { value: string } }) => {
              const digits = e.target.value.replace(/\D/g, '')
              setAmountInput(digits)
            }}
            placeholder="Ví dụ: 20000"
            className="flex-1 rounded-lg border border-lotus-cream px-3 py-2 text-sm text-lotus-deep outline-none focus:border-lotus-rose"
            disabled={isToppingUp}
          />
          <button
            type="button"
            onClick={handleTopUp}
            disabled={isToppingUp}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-lotus-rose px-4 py-2 text-sm font-medium text-white hover:bg-lotus-rose/90 disabled:opacity-60"
          >
            {isToppingUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang chuyển...
              </>
            ) : (
              'Nạp qua VNPay'
            )}
          </button>
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
