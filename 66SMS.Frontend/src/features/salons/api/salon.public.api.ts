import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result } from '@/shared/types/common.types'
import type { SalonDTO } from '../types/salon.types'

const BASE = API.salons

export const salonPublicApi = {
  getActive: () =>
    axiosInstance
      .get<Result<SalonDTO[]>>(`${BASE}/active`)
      .then((r) => r.data.data || []),
}
