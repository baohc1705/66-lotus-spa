import { useEffect } from 'react'
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
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { Info } from 'lucide-react'
import { useCreateSalon, useUpdateSalon } from '../hooks/useSalons'
import {
  createSalonSchema,
  updateSalonSchema,
  type SalonFormValues,
} from '../schemas/salon.schema'
import type { SalonDTO } from '../types/salon.types'

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
  const createMutation = useCreateSalon()
  const updateMutation = useUpdateSalon()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(
      isEdit ? updateSalonSchema : createSalonSchema
    ) as Resolver<SalonFormValues>,
    defaultValues: getDefaultValues(salon),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form
  const statusValue = watch('status')

  useEffect(() => {
    if (open) reset(getDefaultValues(salon))
  }, [open, salon, reset])

  const onSubmit = (data: SalonFormValues) => {
    if (isEdit && salon?.id) {
      updateMutation.mutate(
        { id: salon.id, payload: data },
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    } else {
      createMutation.mutate(
        data as Parameters<typeof createMutation.mutate>[0],
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
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
          {/* Thông tin cơ bản */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-lotus-stone mb-3">
              Thông tin cơ bản
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FormField label="Mã chi nhánh *" error={errors.code?.message}>
                <Input {...register('code')} placeholder="CN001" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Tên chi nhánh *" error={errors.name?.message} className="sm:col-span-2">
                <Input {...register('name')} placeholder="Chi nhánh Quận 1" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Số điện thoại *" error={errors.phone?.message}>
                <Input {...register('phone')} placeholder="0901234567" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <Input {...register('email')} placeholder="chinhanh@spa.vn" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Mã số thuế" error={errors.taxCode?.message}>
                <Input {...register('taxCode')} placeholder="0123456789" className="h-9 text-[13px]" />
              </FormField>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-lotus-stone mb-3">
              Địa chỉ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Địa chỉ đường phố" error={errors.streetAddress?.message}>
                <Input {...register('streetAddress')} placeholder="123 Nguyễn Trãi" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Địa chỉ đầy đủ" error={errors.fullAddress?.message}>
                <Input {...register('fullAddress')} placeholder="123 Nguyễn Trãi, P.2, Q.5, TP.HCM" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Mã tỉnh/thành" error={errors.provinceCode?.message}>
                <Input {...register('provinceCode')} placeholder="79" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Mã phường/xã" error={errors.wardCode?.message}>
                <Input {...register('wardCode')} placeholder="26734" className="h-9 text-[13px]" />
              </FormField>
            </div>
          </div>

          {/* Mô tả & Trạng thái */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-lotus-stone mb-3">
              Mô tả & Trạng thái
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FormField
                label="Ngày làm việc"
                tooltip='Chuỗi số thứ trong tuần, ví dụ "1234567" = tất cả các ngày'
                error={errors.workingDays?.message}
              >
                <Input {...register('workingDays')} placeholder="1234567" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Thứ tự hiển thị" error={errors.sortOrder?.message}>
                <Input {...register('sortOrder')} type="number" placeholder="0" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={statusValue?.toString() ?? '1'}
                  onValueChange={(v) => setValue('status', Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
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
                <Textarea
                  {...register('description')}
                  placeholder="Mô tả chi nhánh..."
                  className="text-[13px] min-h-[80px]"
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
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
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
      <Label className="flex items-center gap-1.5 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired && <span className="text-red-500">*</span>}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-lotus-stone cursor-help hover:text-lotus-leaf transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
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
