import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'

const bookingSchema = z.object({
  name:    z.string().min(2, 'Vui lòng nhập họ tên'),
  phone:   z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ'),
  service: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  date:    z.string().min(1, 'Vui lòng chọn ngày'),
  note:    z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

const SERVICE_OPTIONS = [
  'Massage',
  'Chăm sóc da mặt',
  'Body Treatment',
  'Sản phẩm & Gói',
]

const inputClass = `w-full px-4 py-3 rounded-lg border border-lotus-stone/20 bg-lotus-cream font-sans text-sm text-lotus-deep placeholder:text-lotus-stone/50 focus:outline-none focus:ring-2 focus:ring-lotus-rose/30 focus:border-lotus-rose transition-all duration-300`

export const BookingForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = async (data: BookingFormData) => {
    // Simulate API call — replace with POST to VITE_API_URL/bookings
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Booking submitted:', data)
    setIsSuccess(true)
    reset()
  }

  if (isSuccess) {
    return (
      <div className={`text-center py-12 px-6 bg-lotus-surface rounded-2xl border border-lotus-leaf/20`}>
        <CheckCircle className={`w-16 h-16 text-lotus-leaf mx-auto mb-4`} />
        <h3 className={`font-display text-2xl font-semibold text-lotus-deep mb-2`}>
          Cảm ơn bạn!
        </h3>
        <p className={`font-sans text-base text-lotus-stone mb-6 max-w-sm mx-auto`}>
          Chúng tôi đã nhận được yêu cầu đặt lịch và sẽ liên hệ
          xác nhận trong thời gian sớm nhất.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className={`font-sans text-sm font-medium text-lotus-rose hover:text-lotus-deep transition-colors duration-300 border-b border-lotus-rose/30 hover:border-lotus-deep/30 pb-0.5`}
        >
          Đặt lịch thêm
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`bg-lotus-surface rounded-2xl p-6 md:p-10 shadow-lotus`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Họ tên */}
        <div>
          <label
            htmlFor="booking-name"
            className={`block font-sans text-sm font-medium text-lotus-deep mb-2`}
          >
            Họ và tên
          </label>
          <input
            id="booking-name"
            type="text"
            placeholder="Nguyễn Văn A"
            {...register('name')}
            className={inputClass}
          />
          {errors.name && (
            <span className={`block mt-1 font-sans text-xs text-lotus-error`}>
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label
            htmlFor="booking-phone"
            className={`block font-sans text-sm font-medium text-lotus-deep mb-2`}
          >
            Số điện thoại
          </label>
          <input
            id="booking-phone"
            type="tel"
            placeholder="0901 234 567"
            {...register('phone')}
            className={inputClass}
          />
          {errors.phone && (
            <span className={`block mt-1 font-sans text-xs text-lotus-error`}>
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Dịch vụ */}
        <div>
          <label
            htmlFor="booking-service"
            className={`block font-sans text-sm font-medium text-lotus-deep mb-2`}
          >
            Dịch vụ
          </label>
          <select
            id="booking-service"
            {...register('service')}
            className={inputClass}
          >
            <option value="">Chọn dịch vụ</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.service && (
            <span className={`block mt-1 font-sans text-xs text-lotus-error`}>
              {errors.service.message}
            </span>
          )}
        </div>

        {/* Ngày mong muốn */}
        <div>
          <label
            htmlFor="booking-date"
            className={`block font-sans text-sm font-medium text-lotus-deep mb-2`}
          >
            Ngày mong muốn
          </label>
          <input
            id="booking-date"
            type="date"
            {...register('date')}
            className={inputClass}
          />
          {errors.date && (
            <span className={`block mt-1 font-sans text-xs text-lotus-error`}>
              {errors.date.message}
            </span>
          )}
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label
            htmlFor="booking-note"
            className={`block font-sans text-sm font-medium text-lotus-deep mb-2`}
          >
            Ghi chú{' '}
            <span className="text-lotus-stone font-light">
              (không bắt buộc)
            </span>
          </label>
          <textarea
            id="booking-note"
            rows={3}
            placeholder="Yêu cầu đặc biệt, thời gian mong muốn..."
            {...register('note')}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        id="booking-submit"
        className={`mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-full bg-lotus-rose text-white font-sans font-medium text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Xác nhận đặt lịch'
        )}
      </button>
    </form>
  )
}
