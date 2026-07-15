import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { AdminInput } from '@/shared/components/forms/AdminInput'
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger'
import { FormField } from '@/shared/components/forms/FormField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui/select'
import { useCreatePromotion, useUpdatePromotion } from '../hooks/usePromotions'
import { promotionSchema, type PromotionFormValues } from '../schemas/promotion.schema'
import { DISCOUNT_TYPE_OPTIONS, STATUS_OPTIONS, type PromotionDto } from '../types/promotion.types'
import { COMMON_MSG } from '@/shared/constants/common.messages'
import {
  toDatetimeLocalInput,
  localDateTimeToUtc,
} from '@/shared/utils/date.utils'

interface PromotionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: PromotionDto | null
}


function getDefaultValues(promotion?: PromotionDto | null): PromotionFormValues {
  if (!promotion) {
    return {
      code: '',
      name: '',
      description: '',
      discountType: 1,
      discountValue: undefined,
      maxDiscountAmount: undefined,
      minOrderValue: undefined,
      buyQuantity: undefined,
      getQuantity: undefined,
      usageLimit: undefined,
      startDate: '',
      endDate: '',
      status: 1,
    }
  }
  return {
    code: promotion.code ?? '',
    name: promotion.name ?? '',
    description: promotion.description ?? '',
    discountType: promotion.discountType ?? 1,
    discountValue: promotion.discountValue ?? undefined,
    maxDiscountAmount: promotion.maxDiscountAmount ?? undefined,
    minOrderValue: promotion.minOrderValue ?? undefined,
    buyQuantity: promotion.buyQuantity ?? undefined,
    getQuantity: promotion.getQuantity ?? undefined,
    usageLimit: promotion.usageLimit ?? undefined,
    startDate: toDatetimeLocalInput(promotion.startDate),
    endDate: toDatetimeLocalInput(promotion.endDate),
    status: promotion.status ?? 1,
  }
}

export function PromotionFormDialog({ open, onOpenChange, promotion }: PromotionFormDialogProps) {
  const isEdit = !!promotion

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as Resolver<PromotionFormValues>,
    defaultValues: getDefaultValues(promotion),
  })

  const discountType = watch('discountType')

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(promotion))
    }
  }, [open, promotion, reset])

  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: PromotionFormValues) {
    const payload = {
      ...values,
      startDate: localDateTimeToUtc(values.startDate),
      endDate: localDateTimeToUtc(values.endDate),
    }
    if (isEdit && promotion?.id) {
      updateMutation.mutate(
        { id: promotion.id, payload },
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-adminInk">
            {isEdit ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Row 1: code + name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Mã khuyến mãi *" error={errors.code?.message}>
              <AdminInput {...register('code')} placeholder="VD: SUMMER2025" />
            </FormField>
            <FormField label="Tên chương trình *" error={errors.name?.message}>
              <AdminInput {...register('name')} placeholder="Nhập tên..." />
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Mô tả" error={errors.description?.message}>
            <AdminInput {...register('description')} placeholder="Mô tả ngắn..." />
          </FormField>

          {/* Row 2: discountType + status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Kiểu giảm *" error={errors.discountType?.message}>
              <Select
                value={String(discountType)}
                onValueChange={(val) => setValue('discountType', Number(val))}
              >
                <AdminSelectTrigger>
                  <SelectValue placeholder="Chọn kiểu giảm" />
                </AdminSelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Trạng thái" error={errors.status?.message}>
              <Select
                value={String(watch('status') ?? 1)}
                onValueChange={(val) => setValue('status', Number(val))}
              >
                <AdminSelectTrigger>
                  <SelectValue />
                </AdminSelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Dynamic fields by discountType */}
          {discountType === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField label="Phần trăm giảm (%) *" error={errors.discountValue?.message}>
                <AdminInput
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  {...register('discountValue')}
                  placeholder="VD: 10"
                />
              </FormField>
              <FormField label="Giảm tối đa (VNĐ)" error={errors.maxDiscountAmount?.message}>
                <AdminInput
                  type="number"
                  min="0"
                  {...register('maxDiscountAmount')}
                  placeholder="Để trống = không giới hạn"
                />
              </FormField>
            </div>
          )}

          {discountType === 2 && (
            <FormField label="Số tiền giảm (VNĐ) *" error={errors.discountValue?.message}>
              <AdminInput
                type="number"
                min="0"
                {...register('discountValue')}
                placeholder="VD: 50000"
              />
            </FormField>
          )}

          {discountType === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField label="Số lượng mua (X) *" error={errors.buyQuantity?.message}>
                <AdminInput
                  type="number"
                  min="1"
                  {...register('buyQuantity')}
                  placeholder="VD: 2"
                />
              </FormField>
              <FormField label="Số lượng tặng (Y) *" error={errors.getQuantity?.message}>
                <AdminInput
                  type="number"
                  min="1"
                  {...register('getQuantity')}
                  placeholder="VD: 1"
                />
              </FormField>
            </div>
          )}

          {/* Row: minOrderValue + usageLimit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Đơn hàng tối thiểu (VNĐ)" error={errors.minOrderValue?.message}>
              <AdminInput
                type="number"
                min="0"
                {...register('minOrderValue')}
                placeholder="Để trống = không giới hạn"
              />
            </FormField>
            <FormField label="Giới hạn sử dụng" error={errors.usageLimit?.message}>
              <AdminInput
                type="number"
                min="1"
                {...register('usageLimit')}
                placeholder="Để trống = không giới hạn"
              />
            </FormField>
          </div>

          {/* Row: startDate + endDate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Ngày bắt đầu *" error={errors.startDate?.message}>
              <AdminInput
                type="datetime-local"
                {...register('startDate')}
              />
            </FormField>
            <FormField label="Ngày kết thúc *" error={errors.endDate?.message}>
              <AdminInput
                type="datetime-local"
                {...register('endDate')}
              />
            </FormField>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button type="submit" variant="admin" size="sm" disabled={isPending}>
              {isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo khuyến mãi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
