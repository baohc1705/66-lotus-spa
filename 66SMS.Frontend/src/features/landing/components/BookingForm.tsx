import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from './Button'

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

const inputClass = `landing-focus-ring w-full h-11 px-4 border border-warm-100 bg-surface font-geist text-sm text-ink placeholder:text-warm-600 hover:border-warm-300 focus:border-rose-600 focus:outline-none transition-all duration-200`

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
      <div className={`text-center py-12 px-6 bg-surface border border-success-text/20`}>
        <CheckCircle className={`w-16 h-16 text-success-text mx-auto mb-4`} />
        <h3 className={`font-geist text-2xl font-semibold text-ink mb-2`}>
          Cảm ơn bạn
        </h3>
        <p className={`font-geist text-base text-warm-600 mb-6 max-w-sm mx-auto`}>
          Chúng tôi đã nhận được yêu cầu đặt lịch và sẽ liên hệ
          xác nhận trong thời gian sớm nhất.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className={`landing-focus-ring font-geist text-sm font-medium text-rose-600 hover:text-ink transition-colors duration-200 border-b border-rose-600/30 hover:border-ink/30 pb-0.5`}
        >
          Đặt lịch thêm
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`landing-surface p-6 md:p-10`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Họ tên */}
        <div>
          <label
            htmlFor="booking-name"
            className={`block font-geist text-sm font-medium text-ink mb-2`}
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
            <span className={`block mt-1 font-geist text-xs text-error-text`}>
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label
            htmlFor="booking-phone"
            className={`block font-geist text-sm font-medium text-ink mb-2`}
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
            <span className={`block mt-1 font-geist text-xs text-error-text`}>
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Dịch vụ */}
        <div>
          <label
            htmlFor="booking-service"
            className={`block font-geist text-sm font-medium text-ink mb-2`}
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
            <span className={`block mt-1 font-geist text-xs text-error-text`}>
              {errors.service.message}
            </span>
          )}
        </div>

        {/* Ngày mong muốn */}
        <div>
          <label
            htmlFor="booking-date"
            className={`block font-geist text-sm font-medium text-ink mb-2`}
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
            <span className={`block mt-1 font-geist text-xs text-error-text`}>
              {errors.date.message}
            </span>
          )}
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label
            htmlFor="booking-note"
            className={`block font-geist text-sm font-medium text-ink mb-2`}
          >
            Ghi chú{' '}
            <span className="text-warm-600 font-light">
              (không bắt buộc)
            </span>
          </label>
          <textarea
            id="booking-note"
            rows={3}
            placeholder="Yêu cầu đặc biệt, thời gian mong muốn..."
            {...register('note')}
            className="landing-focus-ring w-full min-h-[80px] px-4 py-3 border border-warm-100/20 bg-page font-geist text-sm text-ink placeholder:text-warm-600/50 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all duration-200 resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        id="booking-submit"
        variant="primary"
        className="mt-8 w-full md:w-auto h-11 px-10"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Xác nhận đặt lịch'
        )}
      </Button>
    </form>
  )
}
