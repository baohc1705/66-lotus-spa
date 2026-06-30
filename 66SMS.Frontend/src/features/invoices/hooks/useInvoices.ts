import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { invoiceApi } from '../api/invoice.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { Result } from '@/shared/types/common.types'
import type { CreateInvoicePayload, GetAllInvoicesQuery } from '../types/invoice.types'

const KEYS = {
  all: ['invoices'] as const,
  lists: () => [...KEYS.all, 'list'] as const,
  list: (params: GetAllInvoicesQuery) => [...KEYS.lists(), params] as const,
  details: () => [...KEYS.all, 'detail'] as const,
  detail: (id: number) => [...KEYS.details(), id] as const,
}

export function useInvoices(params: GetAllInvoicesQuery) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => invoiceApi.getAll(params),
  })
}

export function useInvoiceDetail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => invoiceApi.getDetail(id!),
    enabled: id !== null && id > 0,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => invoiceApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.lists() })
        toast.success('Lập hóa đơn thành công')
      } else {
        toast.error(result.message || 'Không thể lập hóa đơn')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useCancelInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => invoiceApi.cancel(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: KEYS.all })
        toast.success('Hủy hóa đơn thành công')
      } else {
        toast.error(result.message || 'Không thể hủy hóa đơn')
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}
