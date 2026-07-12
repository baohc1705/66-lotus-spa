import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Loader2, Lock } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/schemas/forgotPasswordSchema'
import { Input } from '@/shared/components/ui/input'

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams()
  const resetPasswordMutation = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)

  const emailFromUrl = searchParams.get('email') ?? ''
  const tokenFromUrl = searchParams.get('token') ?? ''
  const linkInvalid = !emailFromUrl || !tokenFromUrl

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data)
  }

  if (linkInvalid) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-error-text">
          Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block text-sm font-semibold text-rose-600 hover:underline"
        >
          Yêu cầu link mới
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register('email')} />
      <input type="hidden" {...register('token')} />

      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none">
            <Lock className="w-5 h-5" />
          </span>
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu mới"
            autoComplete="new-password"
            className="w-full h-11 pl-11 pr-12 rounded-xl border border-warm-100 bg-white text-ink text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-warm-400 hover:text-warm-600"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-error-text font-medium pl-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none">
            <Lock className="w-5 h-5" />
          </span>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Xác nhận mật khẩu"
            autoComplete="new-password"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-ink text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-error-text font-medium pl-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={resetPasswordMutation.isPending}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white bg-rose-600 font-semibold text-sm transition-all duration-200 outline-none hover:bg-rose-500 hover:shadow-lg active:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-warm-400"
      >
        {resetPasswordMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang lưu...</span>
          </>
        ) : (
          <span>Đặt lại mật khẩu</span>
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
