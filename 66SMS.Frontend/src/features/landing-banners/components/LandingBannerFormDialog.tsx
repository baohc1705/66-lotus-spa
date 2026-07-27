import { AdminInput } from '@/shared/components/forms/AdminInput'
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger'
import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui/select'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { fileToBase64 } from '@/shared/lib/fileToBase64'
import {
  useCreateLandingBannerMutation,
  useUpdateLandingBannerMutation,
  useLandingBannerDetail,
} from '../hooks/useLandingBanners'
import {
  createLandingBannerSchema,
  updateLandingBannerSchema,
  type LandingBannerFormValues,
} from '../schemas/landing-banner.schema'
import type { LandingBannerDto } from '../types/landing-banner.types'
import { Loader2 } from 'lucide-react'

interface LandingBannerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bannerId?: number | null
}

const STATUS_OPTIONS = [
  { value: '1', label: 'Đang hiện' },
  { value: '0', label: 'Ẩn' },
]

export function LandingBannerFormDialog({
  open,
  onOpenChange,
  bannerId = null,
}: LandingBannerFormDialogProps) {
  const isEdit = bannerId != null && bannerId > 0
  const detailQuery = useLandingBannerDetail(open && isEdit ? bannerId : null)
  const banner = detailQuery.data?.data
  const createMutation = useCreateLandingBannerMutation()
  const updateMutation = useUpdateLandingBannerMutation()
  const isPending = createMutation.isPending || updateMutation.isPending
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<LandingBannerFormValues>({
    resolver: zodResolver(
      isEdit ? updateLandingBannerSchema : createLandingBannerSchema
    ) as Resolver<LandingBannerFormValues>,
    defaultValues: getDefaultValues(null),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form
  const statusValue = watch('status')
  const imageUrlValue = watch('imageUrl')

  useEffect(() => {
    if (!open) return
    setPendingFile(null)
    if (isEdit) {
      if (banner) reset(getDefaultValues(banner))
    } else {
      reset(getDefaultValues(null))
    }
  }, [open, isEdit, banner, reset])

  const onSubmit = async (data: LandingBannerFormValues) => {
    setIsUploading(true)
    try {
      let imageBase64: string | undefined
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile)
      }
      const payload = {
        ...data,
        imageUrl: data.imageUrl ?? '',
        imageBase64,
      }

      if (isEdit && bannerId) {
        updateMutation.mutate(
          { id: bannerId, payload },
          { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
        )
      } else {
        createMutation.mutate(
          payload as Parameters<typeof createMutation.mutate>[0],
          { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
        )
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật nội dung slide Hero trên trang chủ'
              : 'Thêm slide Hero hiển thị trên landing page'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-16 text-adminGray-600 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải banner...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <ImageUpload
              value={imageUrlValue || banner?.imageUrl}
              onFileChange={setPendingFile}
              shape="square"
              label="Ảnh banner"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField label="Tiêu đề *" error={errors.title?.message} className="sm:col-span-2">
                <AdminInput {...register('title')} placeholder="Tĩnh lặng" />
              </FormField>
              <FormField label="Nhãn thương hiệu" error={errors.brandLabel?.message} className="sm:col-span-2">
                <AdminInput {...register('brandLabel')} placeholder="Hoa Sen Spa · Đồng Tháp" />
              </FormField>
              <FormField label="Mô tả ngắn" error={errors.subtitle?.message} className="sm:col-span-2">
                <AdminInput {...register('subtitle')} placeholder="Mô tả ngắn dưới tiêu đề..." />
              </FormField>
              <FormField label="CTA chính" error={errors.ctaPrimaryText?.message}>
                <AdminInput {...register('ctaPrimaryText')} placeholder="Đặt lịch ngay" />
              </FormField>
              <FormField label="Link CTA chính" error={errors.ctaPrimaryHref?.message}>
                <AdminInput {...register('ctaPrimaryHref')} placeholder="/dat-lich" />
              </FormField>
              <FormField label="CTA phụ" error={errors.ctaSecondaryText?.message}>
                <AdminInput {...register('ctaSecondaryText')} placeholder="Khám phá" />
              </FormField>
              <FormField label="Link CTA phụ" error={errors.ctaSecondaryHref?.message}>
                <AdminInput {...register('ctaSecondaryHref')} placeholder="#about" />
              </FormField>
              <FormField label="Thứ tự" error={errors.sortOrder?.message}>
                <AdminInput {...register('sortOrder')} type="number" placeholder="0" />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={statusValue?.toString() ?? '1'}
                  onValueChange={(v) => setValue('status', Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" variant="admin" size="sm" loading={isPending || isUploading}>
                {isEdit ? 'Cập nhật' : 'Tạo banner'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  const isRequired = label.includes('*')
  const cleanLabel = label.replace('*', '').trim()

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-adminInk/80">
        {cleanLabel}
        {isRequired && <span className="text-state-danger-text">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-state-danger-text font-medium">{error}</p>}
    </div>
  )
}

function getDefaultValues(banner?: LandingBannerDto | null): LandingBannerFormValues {
  if (banner) {
    return {
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      brandLabel: banner.brandLabel ?? '',
      imageUrl: banner.imageUrl ?? '',
      ctaPrimaryText: banner.ctaPrimaryText ?? '',
      ctaPrimaryHref: banner.ctaPrimaryHref ?? '',
      ctaSecondaryText: banner.ctaSecondaryText ?? '',
      ctaSecondaryHref: banner.ctaSecondaryHref ?? '',
      sortOrder: banner.sortOrder ?? 0,
      status: banner.status ?? 1,
    }
  }
  return {
    title: '',
    subtitle: '',
    brandLabel: '',
    imageUrl: '',
    ctaPrimaryText: 'Đặt lịch ngay',
    ctaPrimaryHref: '/dat-lich',
    ctaSecondaryText: 'Khám phá',
    ctaSecondaryHref: '#about',
    sortOrder: 0,
    status: 1,
  }
}
