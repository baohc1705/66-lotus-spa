import { useQuery } from '@tanstack/react-query'
import { addressApi } from '../api/address.api'

export function useProvinces() {
  return useQuery({
    queryKey: ['address', 'provinces'],
    queryFn: addressApi.getProvinces,
    staleTime: Infinity,
  })
}

export function useWardsByProvince(provinceCode: string | null | undefined) {
  return useQuery({
    queryKey: ['address', 'wards', provinceCode ?? ''],
    queryFn: () => addressApi.getWardsByProvince(provinceCode!),
    enabled: !!provinceCode,
    staleTime: Infinity,
  })
}
