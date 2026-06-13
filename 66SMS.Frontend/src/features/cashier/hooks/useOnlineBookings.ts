import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { cashierApi } from '../api/cashier.api'

function getApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return error instanceof Error ? error.message : fallback
}

export function useOnlineBookings() {
  return useQuery({
    queryKey: ['cashier-online-bookings'],
    queryFn: async () => {
      const res = await cashierApi.getOnlineBookings()
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || 'Lỗi tải lịch hẹn online')
      }
      return res.data
    },
    refetchInterval: 30000, // Poll every 30s
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string | number; status: number; note?: string }) => {
      const res = await cashierApi.updateBookingStatus(id, status, note)
      if (!res.isSuccess) {
        throw new Error(res.message || 'Cập nhật trạng thái thất bại')
      }
      return res.data
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['cashier-online-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['cashier-daily'] })
    },
  })
}
