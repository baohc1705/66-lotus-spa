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
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers'
import { useProvinces, useWardsByProvince } from '@/features/address/hooks/useAddress'
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerFormData,
  type UpdateCustomerFormData,
  type CustomerFormValues,
} from '../schemas/customer.schema'

import type { CustomerDto } from '../types/customer.types'
import type { ProvinceDto, WardDto } from '@/features/address/types/address.types'
import { User, ShoppingBag, KeyRound } from 'lucide-react'

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: CustomerDto | null
}

const GENDER_OPTIONS = [
  { value: '0', label: 'Nam' },
  { value: '1', label: 'Nữ' },
  { value: '2', label: 'Khác' },
]

const STATUS_OPTIONS = [
  { value: '1', label: 'Hoạt động' },
  { value: '0', label: 'Ngưng hoạt động' },
  { value: '2', label: 'Tạm khóa' },
]

const TIER_OPTIONS = [
  { value: 'Thường', label: 'Thường' },
  { value: 'Bạc', label: 'Bạc' },
  { value: 'Vàng', label: 'Vàng' },
  { value: 'Kim cương', label: 'Kim cương' },
]

const SOURCE_OPTIONS = [
  { value: 'Walk-in', label: 'Đến trực tiếp' },
  { value: 'Online', label: 'Online' },
  { value: 'Referral', label: 'Giới thiệu' },
  { value: 'Social Media', label: 'Mạng xã hội' },
]

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const isEdit = !!customer
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Dynamic schema & form based on create vs edit
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(isEdit ? updateCustomerSchema : createCustomerSchema) as Resolver<CustomerFormValues>,
    defaultValues: getDefaultValues(customer),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form

  const selectedProvince = watch('provinceCode')
  const provincesQuery = useProvinces()
  const wardsQuery = useWardsByProvince(selectedProvince)

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (open) {
      reset(getDefaultValues(customer))
    }
  }, [open, customer, reset])

  const onSubmit = (data: CustomerFormValues) => {
    const provinceName = provincesQuery.data?.data?.find((p: ProvinceDto) => p.code === data.provinceCode)?.name ?? ''
    const wardName = wardsQuery.data?.data?.find((w: WardDto) => w.code === data.wardCode)?.name ?? ''
    const parts = [data.streetAddress, wardName, provinceName].filter(Boolean)
    const payload = { ...data, fullAddress: parts.join(', ') }

    if (isEdit && customer?.id) {
      updateMutation.mutate(
        { id: customer.id, payload: payload as UpdateCustomerFormData },
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    } else {
      createMutation.mutate(
        payload as CreateCustomerFormData,
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Cập nhật thông tin khách hàng ${customer?.fullName ?? ''}` : 'Điền thông tin để tạo khách hàng mới'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* === Section: Thông tin cá nhân === */}
          <FormSection icon={User} title="Thông tin cá nhân">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Họ tên *" tooltip="Vui lòng nhập họ và tên đầy đủ của khách hàng" error={errors.fullName?.message}>
                <Input {...register('fullName')} placeholder="Nguyễn Văn A" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Số điện thoại *" tooltip="Số điện thoại phải có 10 chữ số" error={errors.phone?.message}>
                <Input {...register('phone')} placeholder="0901234567" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Ngày sinh" error={errors.dob?.message}>
                <Input {...register('dob')} type="date" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Giới tính">
                <Select
                  value={watch('gender')?.toString() ?? ''}
                  onValueChange={(v) => setValue('gender', Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Tỉnh/Thành phố" error={errors.provinceCode?.message}>
                <Select
                  value={watch('provinceCode') ?? ''}
                  onValueChange={v => {
                    setValue('provinceCode', v)
                    setValue('wardCode', '')
                  }}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {provincesQuery.data?.data?.map((p: ProvinceDto) => (
                      <SelectItem key={p.code ?? ''} value={p.code ?? ''}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Phường/Xã" error={errors.wardCode?.message}>
                <Select
                  value={watch('wardCode') ?? ''}
                  onValueChange={v => setValue('wardCode', v)}
                  disabled={!watch('provinceCode') || wardsQuery.isLoading}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn phường/xã" />
                  </SelectTrigger>
                  <SelectContent>
                    {wardsQuery.data?.data?.map((w: WardDto) => (
                      <SelectItem key={w.code ?? ''} value={w.code ?? ''}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Số nhà, tên đường" error={errors.streetAddress?.message} className="sm:col-span-2">
                <Input {...register('streetAddress')} placeholder="123 Đường ABC" className="h-9 text-[13px]" />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Thông tin khách hàng === */}
          <FormSection icon={ShoppingBag} title="Thông tin khách hàng">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Hạng thành viên">
                <Select
                  value={watch('tier') ?? ''}
                  onValueChange={(v) => setValue('tier', v)}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn hạng" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Điểm tích lũy" error={errors.loyaltyPoint?.message}>
                <Input
                  {...register('loyaltyPoint')}
                  type="number"
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Nguồn khách">
                <Select
                  value={watch('source') ?? ''}
                  onValueChange={(v) => setValue('source', v)}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={watch('status')?.toString() ?? '1'}
                  onValueChange={(v) => setValue('status', Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Ghi chú" error={errors.note?.message} className="sm:col-span-2">
                <Textarea {...register('note')} placeholder="Ghi chú thêm về khách hàng..." className="text-[13px] min-h-[60px] resize-none" />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Tài khoản (chỉ khi tạo mới) === */}
          {!isEdit && (
            <FormSection icon={KeyRound} title="Tài khoản đăng nhập">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <FormField label="Tên tài khoản *" tooltip="Tên đăng nhập viết liền, không dấu, không chứa ký tự đặc biệt" error={(errors as Record<string, { message?: string }>).userName?.message}>
                  <Input {...register('userName')} placeholder="nguyenvana" className="h-9 text-[13px]" />
                </FormField>
                <FormField label="Email *" tooltip="Địa chỉ email hợp lệ (ví dụ: user@example.com)" error={errors.email?.message}>
                  <Input {...register('email')} type="email" placeholder="kh@hoasenspa.com" className="h-9 text-[13px]" />
                </FormField>
                <FormField label="Mật khẩu *" tooltip="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt" error={(errors as Record<string, { message?: string }>).password?.message}>
                  <Input {...register('password')} type="password" placeholder="••••••••" className="h-9 text-[13px]" />
                </FormField>
                <FormField label="Xác nhận mật khẩu *" tooltip="Nhập lại mật khẩu khớp với mật khẩu ở trên" error={(errors as Record<string, { message?: string }>).confirmPassword?.message}>
                  <Input {...register('confirmPassword')} type="password" placeholder="••••••••" className="h-9 text-[13px]" />
                </FormField>
              </div>
            </FormSection>
          )}

          {/* === Account fields khi edit === */}
          {isEdit && (
            <FormSection icon={KeyRound} title="Tài khoản">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <FormField label="Tên tài khoản *" tooltip="Tên đăng nhập viết liền, không dấu" error={errors.userName?.message}>
                  <Input {...register('userName')} placeholder="nguyenvana" className="h-9 text-[13px]" />
                </FormField>
                <FormField label="Email *" tooltip="Địa chỉ email hợp lệ" error={errors.email?.message}>
                  <Input {...register('email')} type="email" placeholder="kh@hoasenspa.com" className="h-9 text-[13px]" />
                </FormField>
              </div>
            </FormSection>
          )}

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
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={isPending}
            >
              {isEdit ? 'Cập nhật' : 'Tạo khách hàng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---- Helper Components ----

function FormSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
        <Icon className="w-4 h-4 text-lotus-leaf" />
        <h3 className="text-[13px] font-semibold text-lotus-deep">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function FormField({ label, error, tooltip, className, children }: { label: string; error?: string; tooltip?: string; className?: string; children: React.ReactNode }) {
  const isRequired = label.includes('*');
  const cleanLabel = label.replace('*', '').trim();

  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label className="flex items-center gap-1 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired && (
          tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-red-500 cursor-help hover:text-red-600 focus:outline-none select-none">
                  *
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-red-500">*</span>
          )
        )}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ---- Default Values ----

function getDefaultValues(customer?: CustomerDto | null): CustomerFormValues {
  if (customer) {
    return {
      fullName: customer.fullName ?? '',
      phone: customer.phone ?? '',
      dob: customer.dob ?? '',
      gender: customer.gender ? Number(customer.gender) : undefined,
      image: customer.image ?? '',
      tier: customer.tier ?? '',
      loyaltyPoint: customer.loyaltyPoint ?? undefined,
      source: customer.source ?? '',
      status: customer.status ? Number(customer.status) : 1,
      note: customer.note ?? '',
      streetAddress: customer.streetAddress ?? '',
      provinceCode: customer.provinceCode ?? '',
      wardCode: customer.wardCode ?? '',
      fullAddress: customer.fullAddress ?? '',
      userName: customer.username ?? '',
      email: customer.email ?? '',
    }
  }
  return {
    fullName: '',
    phone: '',
    dob: '',
    gender: undefined,
    image: '',
    tier: '',
    loyaltyPoint: undefined,
    source: '',
    status: 1,
    note: '',
    streetAddress: '',
    provinceCode: '',
    wardCode: '',
    fullAddress: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
}
