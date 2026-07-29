import type { AxiosError } from 'axios'
import type { Result } from '@/shared/types/common.types'

export function getErrorMessage(
  error: AxiosError<Result<unknown>>,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại'
): string {
  return error.response?.data?.message ?? fallback
}
