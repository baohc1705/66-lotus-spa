import axiosInstance from '@/shared/api/axiosInstance'
import type { Result } from '@/shared/types/common.types'
import type { ProvinceDto, WardDto } from '../types/address.types'

export const addressApi = {
  getProvinces: () =>
    axiosInstance
      .get<Result<ProvinceDto[]>>('/address/provinces')
      .then(r => r.data),

  getWardsByProvince: (provinceCode: string) =>
    axiosInstance
      .get<Result<WardDto[]>>('/address/wards', { params: { provinceCode } })
      .then(r => r.data),
}
