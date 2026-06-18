import axiosInstance from '@/shared/api/axiosInstance'
import type { Result } from '@/shared/types/common.types'
import type { SalonDTO } from '../types/salon.types'

const BASE = '/Salons'

export const salonPublicApi = {
  getActive: () =>
    axiosInstance
      .get<Result<SalonDTO[]>>(`${BASE}/active`)
      .then((r) => r.data.data || []),
}
