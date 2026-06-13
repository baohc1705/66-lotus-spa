import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cashierApi } from '../api/cashier.api'

export function VnPayReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const processReturn = async () => {
      try {
        const queryString = searchParams.toString()
        if (!queryString) {
          setStatus('error')
          setMessage('Không có thông tin thanh toán.')
          return
        }

        const data = await cashierApi.vnPayReturn(queryString)

        if (data.isSuccess) {
          await queryClient.invalidateQueries({ queryKey: ['cashier-daily'] })
          setStatus('success')
          setMessage(data.data || data.message || 'Thanh toán thành công!')
        } else {
          setStatus('error')
          setMessage(data.message || 'Giao dịch thanh toán thất bại.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Lỗi không xác định khi xử lý thanh toán.')
      }
    }

    processReturn()
  }, [searchParams, queryClient])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF7F2]">
      <div className="bg-white p-8 rounded-[24px] shadow-[0_20px_40px_rgba(42,31,26,0.1)] w-full max-w-md text-center border border-lotus-gold/20">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-lotus-leaf animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-lotus-deep">Đang xử lý kết quả...</h2>
            <p className="text-lotus-stone mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-lotus-leaf/10 rounded-full flex items-center justify-center mb-4 border border-lotus-leaf/20">
              <CheckCircle2 className="w-10 h-10 text-lotus-leaf" />
            </div>
            <h2 className="text-2xl font-bold text-lotus-deep mb-2">Thanh toán thành công!</h2>
            <p className="text-lotus-stone mb-6">{message}</p>
            <button
              onClick={() => navigate('/thu-ngan')}
              className="px-6 py-3 bg-lotus-leaf text-white rounded-admin font-medium hover:bg-lotus-leaf/90 transition-colors w-full shadow-md shadow-lotus-leaf/20"
            >
              Quay lại trang thu ngân
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-lotus-rose/10 rounded-full flex items-center justify-center mb-4 border border-lotus-rose/20">
              <XCircle className="w-10 h-10 text-lotus-rose" />
            </div>
            <h2 className="text-2xl font-bold text-lotus-deep mb-2">Thanh toán thất bại</h2>
            <p className="text-lotus-stone mb-6">{message}</p>
            <button
              onClick={() => navigate('/thu-ngan')}
              className="px-6 py-3 bg-lotus-cream text-lotus-deep border border-lotus-gold/20 rounded-admin font-medium hover:bg-lotus-gold/20 transition-colors w-full"
            >
              Quay lại trang thu ngân
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
