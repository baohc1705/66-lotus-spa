import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/features/auth/api/authApi'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import { toast } from 'sonner'
import type { Result } from '@/shared/types/common.types'

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success(result.message || 'Đặt lại mật khẩu thành công')
        navigate('/login')
      } else {
        toast.error(result.message)
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Đặt lại mật khẩu thất bại')),
  })
}
