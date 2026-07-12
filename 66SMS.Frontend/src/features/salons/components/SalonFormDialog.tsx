import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui/select'
import { Info } from 'lucide-react'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { uploadApi } from '@/shared/api/upload.api'
import { useCreateSalonMutation, useUpdateSalonMutation } from '../hooks/useSalons'
import { useProvinces, useWardsByProvince } from '@/features/address/hooks/useAddress'
import { SearchableSelect } from '@/shared/components/ui/searchable-select'
import {
  createSalonSchema,
  updateSalonSchema,
  type SalonFormValues,
} from '../schemas/salon.schema'
import type { SalonDTO } from '../types/salon.types'
import type { ProvinceDto, WardDto } from '@/features/address/types/address.types'

interface SalonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salon?: SalonDTO | null
}

const STATUS_OPTIONS = [
  { value: '1', label: 'Hoạt động' },
  { value: '0', label: 'Tạm đóng' },
  { value: '3', label: 'Đóng cửa' },
]

export function SalonFormDialog({ open, onOpenChange, salon }: SalonFormDialogProps) {
  const isEdit = !!salon
  const createMutation = useCreateSalonMutation()
  const updateMutation = useUpdateSalonMutation()
  const isPending = createMutation.isPending || updateMutation.isPending
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(
      isEdit ? updateSalonSchema : createSalonSchema
    ) as Resolver<SalonFormValues>,
    defaultValues: getDefaultValues(salon),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form
  const statusValue = watch('status')
  const imageUrlValue = watch('imageUrl')
  const selectedProvince = watch('provinceCode')
  const provincesQuery = useProvinces()
  const wardsQuery = useWardsByProvince(selectedProvince)

  useEffect(() => {
    if (open) {
      setPendingFile(null)
      reset(getDefaultValues(salon))
    }
  }, [open, salon, reset])

  const onSubmit = async (data: SalonFormValues) => {
    setIsUploading(true)
    try {
      let imageUrl = data.imageUrl ?? ''
      if (pendingFile) {
        const result = await uploadApi.uploadImage(pendingFile, 'salon')
        imageUrl = (result.isSuccess && result.data) ? result.data : ''
      }
      const provinceName = provincesQuery.data?.data?.find((p: ProvinceDto) => p.code === data.provinceCode)?.name ?? ''
      const wardName = wardsQuery.data?.data?.find((w: WardDto) => w.code === data.wardCode)?.name ?? ''
      const parts = [data.streetAddress, wardName, provinceName].filter(Boolean)
      const payload = { ...data, imageUrl, fullAddress: parts.join(', ') }

      if (isEdit && salon?.id) {
        updateMutation.mutate(
          { id: salon.id, payload },
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin chi nhánh ${salon?.name ?? ''}`
              : 'Điền thông tin để tạo chi nhánh mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-5">
            <ImageUpload
              value={imageUrlValue || salon?.imageUrl}
              onFileChange={setPendingFile}
              shape="square"
              label="Đổi ảnh chi nhánh"
            />
          </div>

          {/* Thông tin cơ bản */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-adminGray-600 mb-3">
              Thông tin cơ bản
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FormField label="Mã chi nhánh *" error={errors.code?.message}>
                <AdminInput {...register('code')} placeholder="CN001" />
              </FormField>
              <FormField label="Tên chi nhánh *" error={errors.name?.message} className="sm:col-span-2">
                <AdminInput {...register('name')} placeholder="Chi nhánh Quận 1" />
              </FormField>
              <FormField label="Số điện thoại *" error={errors.phone?.message}>
                <AdminInput {...register('phone')} placeholder="0901234567" />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <AdminInput {...register('email')} placeholder="chinhanh@spa.vn" />
              </FormField>
              <FormField label="Mã số thuế" error={errors.taxCode?.message}>
                <AdminInput {...register('taxCode')} placeholder="0123456789" />
              </FormField>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-adminGray-600 mb-3">
              Địa chỉ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Tỉnh/Thành phố" error={errors.provinceCode?.message}>
                <SearchableSelect
                  value={watch('provinceCode') ?? ''}
                  onValueChange={v => {
                    setValue('provinceCode', v)
                    setValue('wardCode', '')
                  }}
                  options={(provincesQuery.data?.data ?? []).map((p: ProvinceDto) => ({ value: p.code ?? '', label: p.name ?? '' }))}
                  placeholder="Chọn tỉnh/thành phố"
                  searchPlaceholder="Tìm tỉnh/thành phố..."
                  className="h-9"
                />
              </FormField>
              <FormField label="Phường/Xã" error={errors.wardCode?.message}>
                <SearchableSelect
                  value={watch('wardCode') ?? ''}
                  onValueChange={v => setValue('wardCode', v)}
                  options={(wardsQuery.data?.data ?? []).map((w: WardDto) => ({ value: w.code ?? '', label: w.name ?? '' }))}
                  placeholder="Chọn phường/xã"
                  searchPlaceholder="Tìm phường/xã..."
                  disabled={!watch('provinceCode') || wardsQuery.isLoading}
                  className="h-9"
                />
              </FormField>
              <FormField label="Số nhà, tên đường" error={errors.streetAddress?.message} className="sm:col-span-2">
                <AdminInput {...register('streetAddress')} placeholder="123 Nguyễn Trãi" />
              </FormField>
            </div>
          </div>

          {/* Mô tả & Trạng thái */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-adminGray-600 mb-3">
              Mô tả & Trạng thái
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FormField
                label="Ngày làm việc"
                tooltip='Chuỗi số thứ trong tuần, ví dụ "1234567" = tất cả các ngày'
                error={errors.workingDays?.message}
              >
                <AdminInput {...register('workingDays')} placeholder="1234567" />
              </FormField>
              <FormField label="Thứ tự hiển thị" error={errors.sortOrder?.message}>
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
              <FormField label="Mô tả" error={errors.description?.message} className="sm:col-span-3">
                <AdminTextarea
                  {...register('description')}
                  placeholder="Mô tả chi nhánh..."
                  className="text-sm min-h-[80px]"
                />
              </FormField>
            </div>
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
              {isEdit ? 'Cập nhật' : 'Tạo chi nhánh'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  error,
  tooltip,
  className,
  children,
}: {
  label: string
  error?: string
  tooltip?: string
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
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-adminGray-600 cursor-help hover:text-adminGreen-600 transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-state-danger-text font-medium">{error}</p>}
    </div>
  )
}

function getDefaultValues(salon?: SalonDTO | null): SalonFormValues {
  if (salon) {
    return {
      code: salon.code ?? '',
      name: salon.name ?? '',
      phone: salon.phone ?? '',
      email: salon.email ?? '',
      streetAddress: salon.streetAddress ?? '',
      provinceCode: salon.provinceCode ?? '',
      wardCode: salon.wardCode ?? '',
      fullAddress: salon.fullAddress ?? '',
      taxCode: salon.taxCode ?? '',
      workingDays: salon.workingDays ?? '',
      imageUrl: salon.imageUrl ?? '',
      description: salon.description ?? '',
      sortOrder: salon.sortOrder ?? 0,
      status: salon.status ?? 1,
    }
  }
  return {
    code: '',
    name: '',
    phone: '',
    email: '',
    streetAddress: '',
    provinceCode: '',
    wardCode: '',
    fullAddress: '',
    taxCode: '',
    workingDays: '',
    imageUrl: '',
    description: '',
    sortOrder: 0,
    status: 1,
  }
}
