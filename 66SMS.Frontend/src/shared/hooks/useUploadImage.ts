import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { uploadApi } from '@/shared/api/upload.api'
import { getErrorMessage } from '@/shared/utils/errorUtils'
import type { Result } from '@/shared/types/common.types'

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadApi.uploadImage(file, folder),
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}

export function useUploadImages() {
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadApi.uploadImages(files, folder),
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })
}
