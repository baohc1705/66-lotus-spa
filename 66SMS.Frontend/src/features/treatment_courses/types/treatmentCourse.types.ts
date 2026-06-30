export interface TreatmentCourseItemDto {
  id: number | null
  treatmentCourseId: number | null
  serviceId: number | null
  serviceName: string | null
  sessionNumber: number | null
  quantity: number | null
  note: string | null
  status: number | null
}

export interface TreatmentCourseDto {
  id: number | null
  categoryId: number | null
  categoryName: string | null
  code: string | null
  name: string | null
  description: string | null
  content: string | null
  totalSessions: number | null
  originalPrice: number | null
  sellingPrice: number | null
  imageUrl: string | null
  sortOrder: number | null
  status: number | null
  createdAt: string | null
  createdBy: number | null
  updatedAt: string | null
  updatedBy: number | null
  items: TreatmentCourseItemDto[] | null
}

export interface TreatmentCourseItemPayload {
  serviceId: number
  sessionNumber: number
  quantity: number
  note?: string
  status?: number
}

export interface CreateTreatmentCoursePayload {
  code: string
  name: string
  description?: string
  content?: string
  categoryId?: number
  originalPrice: number
  sellingPrice: number
  imageUrl?: string
  sortOrder?: number
  status?: number
  items: TreatmentCourseItemPayload[]
}

export interface UpdateTreatmentCoursePayload {
  code?: string
  name?: string
  description?: string
  content?: string
  categoryId?: number
  originalPrice?: number
  sellingPrice?: number
  imageUrl?: string
  sortOrder?: number
  status?: number
  items?: TreatmentCourseItemPayload[]
}
