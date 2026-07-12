import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/schemas/forgotPasswordSchema'
import { Input } from '@/shared/components/ui/input'

export const ForgotPasswordForm = () => {
  const forgotPasswordMutation = useForgotPassword()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) setSent(true)
      },
    })
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-warm-600 leading-relaxed">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật
          khẩu. Vui lòng kiểm tra hộp thư (và mục spam).
        </p>
        <Link
          to="/login"
          className="inline-block text-sm font-semibold text-rose-600 hover:text-rose-500 hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-warm-600 text-center mb-2">
        Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>

      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none">
            <Mail className="w-5 h-5" />
          </span>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-ink text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-error-text font-medium pl-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white bg-rose-600 font-semibold text-sm transition-all duration-200 outline-none hover:bg-rose-500 hover:shadow-lg active:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-warm-400"
      >
        {forgotPasswordMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang gửi...</span>
          </>
        ) : (
          <span>Gửi link đặt lại</span>
        )}
      </button>

      <div className="text-center text-xs text-warm-600">
        <Link
          to="/login"
          className="font-semibold text-rose-600 hover:text-rose-500 hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  )
}
