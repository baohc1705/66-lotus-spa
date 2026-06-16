import type { PageRequest } from '@/shared/types/common.types'

export interface SalonDTO {
  id?: number
  code?: string
  name?: string
  phone?: string
  email?: string
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
  latitude?: number
  longitude?: number
  workingDays?: string
  taxCode?: string
  imageUrl?: string
  description?: string
  sortOrder?: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateSalonPayload {
  code: string
  name: string
  phone: string
  email?: string
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
  latitude?: number
  longitude?: number
  workingDays?: string
  taxCode?: string
  imageUrl?: string
  description?: string
  sortOrder?: number
  status?: number
}

export interface UpdateSalonPayload extends Partial<CreateSalonPayload> {}

export interface SalonQueryParams extends PageRequest {
  keyword?: string
  status?: number
}
