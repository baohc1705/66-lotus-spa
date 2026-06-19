// Tiện ích xử lý lỗi từ API.
// Dùng trong onError của useMutation để hiển thị message lỗi từ backend.

import type { AxiosError } from 'axios'
import type { Result } from '@/shared/types/common.types'

// Lấy message lỗi từ response API.
// Nếu backend không gửi message → hiển thị câu fallback.
//
// Cách dùng trong hook:
//   onError: (error: AxiosError<Result<unknown>>) => {
//     toast.error(getErrorMessage(error))
//   }
export function getErrorMessage(
  error: AxiosError<Result<unknown>>,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại'
): string {
  return error.response?.data?.message ?? fallback
}
