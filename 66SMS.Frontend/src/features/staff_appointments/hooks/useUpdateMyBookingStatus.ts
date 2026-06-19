import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { staffScheduleApi } from '../api'

function getApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return error instanceof Error ? error.message : fallback
}

export function useUpdateMyBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string | number
      status: number
      note?: string
    }) => {
      const res = await staffScheduleApi.updateBookingStatus(id, status, note)
      if (!res.isSuccess) {
        throw new Error(res.message || 'Cập nhật trạng thái thất bại')
      }
      return res
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['staff-schedule-daily'] })
      queryClient.invalidateQueries({ queryKey: ['staff-schedule-weekly'] })
      queryClient.invalidateQueries({ queryKey: ['cashier-daily'] })
    },
    onError: (error) => {
      toast.error(getApiError(error, 'Cập nhật trạng thái thất bại'))
    },
  })
}
