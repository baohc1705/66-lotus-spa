import { useMutation } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { toast } from 'sonner'

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success('Đổi mật khẩu thành công')
      } else {
        toast.error(result.message ?? 'Đổi mật khẩu thất bại')
      }
    },
    onError: () => {
      toast.error('Không thể kết nối đến máy chủ')
    },
  })
}
