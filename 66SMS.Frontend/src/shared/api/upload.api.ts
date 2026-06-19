import axiosInstance from './axiosInstance'
import { API } from './endpoints'
import type { Result } from '@/shared/types/common.types'

export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    const params = folder ? { folder } : {}
    return axiosInstance
      .post<Result<string>>(API.media.image, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
      })
      .then(r => r.data)
  },

  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const params = folder ? { folder } : {}
    return axiosInstance
      .post<Result<string[]>>(API.media.images, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params,
      })
      .then(r => r.data)
  },
}
