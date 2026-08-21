import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { authApi } from '@/features/auth/api/authApi'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import { toast } from "@/shared/utils/kitToast";
import type { Result } from '@/shared/types/common.types'

export const useForgotPassword = () =>
  useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success(
          result.message ||
            'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
        )
      } else {
        toast.error(result.message)
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Gửi yêu cầu thất bại')),
  })
