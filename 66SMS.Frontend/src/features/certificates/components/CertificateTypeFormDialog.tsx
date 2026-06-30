import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useCreateCertificateType, useUpdateCertificateType } from '../hooks/useCertificateTypes'
import type { CertificateTypeDTO } from '../types/certificate.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: CertificateTypeDTO | null
}

interface FormValues {
  code: string
  name: string
  description: string
  sortOrder: number
  status: number
}

function getDefaults(item?: CertificateTypeDTO | null): FormValues {
  return {
    code: item?.code ?? '',
    name: item?.name ?? '',
    description: item?.description ?? '',
    sortOrder: item?.sortOrder ?? 0,
    status: item?.status ?? 1,
  }
}

export function CertificateTypeFormDialog({ open, onOpenChange, item }: Props) {
  const isEdit = !!item
  const createMutation = useCreateCertificateType()
  const updateMutation = useUpdateCertificateType()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: getDefaults(item),
  })

  useEffect(() => {
    if (open) reset(getDefaults(item))
  }, [open, item, reset])

  const onSubmit = (data: FormValues) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      sortOrder: data.sortOrder,
      status: data.status,
    }

    if (isEdit && item?.id) {
      updateMutation.mutate(
        { id: item.id, payload },
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    } else {
      createMutation.mutate(payload as Parameters<typeof createMutation.mutate>[0], {
        onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa loại chứng chỉ' : 'Thêm loại chứng chỉ'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Cập nhật thông tin loại chứng chỉ "${item?.name ?? ''}"` : 'Điền thông tin để tạo loại chứng chỉ mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Mã loại *" error={errors.code?.message}>
            <Input {...register('code', { required: 'Mã loại là bắt buộc' })} placeholder="MASSAGE" className="h-9 text-[13px]" />
          </FormField>
          <FormField label="Tên loại chứng chỉ *" error={errors.name?.message}>
            <Input {...register('name', { required: 'Tên là bắt buộc' })} placeholder="Chứng chỉ Massage Trị liệu" className="h-9 text-[13px]" />
          </FormField>
          <FormField label="Mô tả">
            <Textarea {...register('description')} placeholder="Mô tả loại chứng chỉ..." className="text-[13px] min-h-[72px]" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Thứ tự hiển thị">
              <Input {...register('sortOrder', { valueAsNumber: true })} type="number" placeholder="0" className="h-9 text-[13px]" />
            </FormField>
            <FormField label="Trạng thái">
              <Select value={watch('status')?.toString()} onValueChange={(v) => setValue('status', Number(v))}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Tạm đóng</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              {isEdit ? 'Cập nhật' : 'Tạo loại chứng chỉ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({ label, error, className, children }: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  const isRequired = label.includes('*')
  const cleanLabel = label.replace('*', '').trim()
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="flex items-center gap-1 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}
