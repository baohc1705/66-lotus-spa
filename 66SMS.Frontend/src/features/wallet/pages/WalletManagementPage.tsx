import { formatCurrency } from '@/shared/utils/currency';
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminWallets } from '../api/wallet.api'
import type { AdminWalletDto } from '../types/wallet.types'
import { WalletTransactionModal } from '../components/WalletTransactionModal'
import { Loader2, Search, Wallet } from 'lucide-react'


export function WalletManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<{ id: number, name: string } | null>(null)

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: getAdminWallets,
  })

  const wallets = response?.data || []
  
  const filteredWallets = wallets.filter((w: AdminWalletDto) => 
    w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.customerPhone.includes(searchTerm)
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-lotus-rose/10 text-lotus-rose rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          Quản lý Ví Khách Hàng
        </h1>
        <p className="text-gray-500 mt-2">Xem danh sách ví của khách hàng và quản lý giao dịch.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-lotus-rose focus:border-lotus-rose"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Khách hàng</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Số dư (VND)</th>
                <th className="px-6 py-4">Cập nhật lần cuối</th>
                <th className="px-6 py-4 text-center rounded-tr-xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-lotus-rose mx-auto" />
                  </td>
                </tr>
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                filteredWallets.map((wallet: AdminWalletDto) => (
                  <tr key={wallet.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lotus-gold/20 flex items-center justify-center text-lotus-gold font-bold shrink-0">
                        {wallet.customerName.charAt(0)}
                      </div>
                      {wallet.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {wallet.customerPhone}
                    </td>
                    <td className="px-6 py-4 font-bold text-lotus-rose">
                      {formatCurrency(wallet.balance)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(wallet.updatedAt || wallet.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedWallet({ id: wallet.id, name: wallet.customerName })}
                        className="text-lotus-leaf hover:text-lotus-leaf/80 font-medium hover:underline"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WalletTransactionModal 
        walletId={selectedWallet?.id || null} 
        customerName={selectedWallet?.name || ''} 
        isOpen={!!selectedWallet} 
        onClose={() => setSelectedWallet(null)} 
      />
    </div>
  )
}
