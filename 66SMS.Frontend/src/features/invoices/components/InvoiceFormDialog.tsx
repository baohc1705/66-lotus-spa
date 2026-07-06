import { useEffect } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { SearchableSelect } from '@/shared/components/ui/searchable-select'
import { Plus, Trash2, User, ShoppingCart, Wallet } from 'lucide-react'
import { invoiceSchema, type InvoiceFormValues } from '../schemas/invoice.schema'
import { useCreateInvoice } from '../hooks/useInvoices'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { useServices } from '@/features/services/hooks/useServices'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useTreatmentCourses } from '@/features/treatment_courses/hooks/useTreatmentCourses'
import { useStaffs } from '@/features/staffs/hooks/useStaffs'
import type { CustomerDto } from '@/features/customers/types/customer.types'
import type { ServiceDTO } from '@/features/services/types/service.types'
import type { ProductDto } from '@/features/products/types/product.types'
import type { TreatmentCourseDto } from '@/features/treatment_courses/types/treatmentCourse.types'
import type { StaffDto } from '@/features/staffs/types/staff.types'
import { useSalons } from '@/features/salons/hooks/useSalons'
import type { SalonDTO } from '@/features/salons/types/salon.types'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { COMMON_MSG } from '@/shared/constants/common.messages'
import {
  INVOICE_ITEM_TYPE, PAYMENT_METHOD, POINT_VALUE_VND,
  type CreateInvoicePayload,
} from '../types/invoice.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ITEM_TYPE_OPTIONS = [
  { value: String(INVOICE_ITEM_TYPE.SERVICE), label: 'Dịch vụ' },
  { value: String(INVOICE_ITEM_TYPE.PRODUCT), label: 'Sản phẩm' },
  { value: String(INVOICE_ITEM_TYPE.TREATMENT_COURSE), label: 'Liệu trình' },
]

const PAYMENT_OPTIONS = [
  { value: String(PAYMENT_METHOD.CASH), label: 'Tiền mặt' },
  { value: String(PAYMENT_METHOD.BANK_TRANSFER), label: 'Chuyển khoản' },
  { value: String(PAYMENT_METHOD.WALLET), label: 'Ví' },
  { value: String(PAYMENT_METHOD.VNPAY), label: 'VNPay' },
]

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'

export function InvoiceFormDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateInvoice()
  const isPending = createMutation.isPending

  // Tải dữ liệu cho các ô chọn
  const effectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId())
  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 })
  const salons: SalonDTO[] = salonsResult?.data?.items ?? []
  const customers: CustomerDto[] = useCustomers({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? []
  const services: ServiceDTO[] = useServices({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? []
  const products: ProductDto[] = useProducts({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? []
  const courses: TreatmentCourseDto[] = useTreatmentCourses({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? []
  const staffs: StaffDto[] = useStaffs({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? []

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: getDefaultValues(effectiveSalonId ?? undefined),
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    if (open) reset(getDefaultValues(effectiveSalonId ?? undefined))
  }, [open, reset, effectiveSalonId])

  // ---- Lấy đơn giá theo loại + id (để xem trước) ----
  const getUnitPrice = (itemType: number, refId: number): number => {
    if (!refId) return 0
    if (itemType === INVOICE_ITEM_TYPE.SERVICE)
      return services.find(s => s.id === refId)?.sellingPrice ?? 0
    if (itemType === INVOICE_ITEM_TYPE.PRODUCT)
      return products.find(p => p.id === refId)?.sellingPrice ?? 0
    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE)
      return courses.find(c => c.id === refId)?.sellingPrice ?? 0
    return 0
  }

  const getOptionsForType = (itemType: number) => {
    if (itemType === INVOICE_ITEM_TYPE.SERVICE)
      return services.map(s => ({ value: String(s.id ?? ''), label: `${s.name ?? ''} — ${fmt(s.sellingPrice ?? 0)}` }))
    if (itemType === INVOICE_ITEM_TYPE.PRODUCT)
      return products.map(p => ({ value: String(p.id ?? ''), label: `${p.name ?? ''} — ${fmt(p.sellingPrice ?? 0)}` }))
    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE)
      return courses.map(c => ({ value: String(c.id ?? ''), label: `${c.name ?? ''} — ${fmt(c.sellingPrice ?? 0)}` }))
    return []
  }

  // ---- Xem trước tổng tiền (ước tính phía client; backend là nguồn chính xác) ----
  const watchedItems = watch('items')
  const subTotal = (watchedItems ?? []).reduce((sum, it) => {
    const unit = getUnitPrice(Number(it.itemType), Number(it.refId))
    const line = unit * Number(it.quantity || 0) - Number(it.discountAmount || 0)
    return sum + Math.max(line, 0)
  }, 0)
  const manualDiscount = Number(watch('discountAmount') || 0)
  const pointsValue = Number(watch('loyaltyPointsUsed') || 0) * POINT_VALUE_VND
  const tax = Number(watch('taxAmount') || 0)
  const totalPreview = Math.max(subTotal - manualDiscount - pointsValue + tax, 0)

  const onSubmit = (data: InvoiceFormValues) => {
    const payload: CreateInvoicePayload = {
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      customerPhone: data.customerPhone || undefined,
      salonId: data.salonId || undefined,
      discountAmount: data.discountAmount || 0,
      applyMembershipDiscount: data.applyMembershipDiscount ?? true,
      loyaltyPointsUsed: data.loyaltyPointsUsed || 0,
      taxAmount: data.taxAmount || 0,
      paymentMethod: data.paymentMethod,
      paidAmount: data.paidAmount || 0,
      transactionId: data.transactionId || undefined,
      note: data.note || undefined,
      items: data.items.map(i => ({
        itemType: i.itemType,
        refId: i.refId,
        quantity: i.quantity,
        discountAmount: i.discountAmount || 0,
        staffId: i.staffId || undefined,
        note: i.note || undefined,
      })),
    }
    createMutation.mutate(payload, {
      onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lập hóa đơn</DialogTitle>
          <DialogDescription>Chọn khách hàng (hoặc khách vãng lai), thêm dịch vụ/sản phẩm/liệu trình rồi thanh toán.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Khách hàng */}
          <FormSection icon={User} title="Khách hàng">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Khách hàng (có sẵn)">
                <SearchableSelect
                  value={watch('customerId')?.toString() ?? ''}
                  onValueChange={(v) => setValue('customerId', v ? Number(v) : undefined)}
                  options={customers.map((c: CustomerDto) => ({ value: String(c.id ?? ''), label: `${c.fullName ?? ''} — ${c.phone ?? ''}` }))}
                  placeholder="Chọn khách (bỏ trống nếu khách vãng lai)"
                  searchPlaceholder="Tìm tên / SĐT..."
                  className="h-9"
                />
              </FormField>
              <FormField label="Chi nhánh / Salon">
                <SearchableSelect
                  value={watch('salonId')?.toString() ?? ''}
                  onValueChange={(v) => setValue('salonId', v ? Number(v) : undefined)}
                  options={salons.map((s: SalonDTO) => ({ value: String(s.id ?? ''), label: `${s.name ?? ''} — ${s.code ?? ''}` }))}
                  placeholder="Chọn chi nhánh..."
                  searchPlaceholder="Tìm chi nhánh..."
                  className="h-9"
                />
              </FormField>
              <FormField label="Tên khách vãng lai">
                <Input {...register('customerName')} placeholder="VD: Chị Lan" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="SĐT khách vãng lai">
                <Input {...register('customerPhone')} placeholder="09xxxxxxxx" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Hình thức TT *" error={errors.paymentMethod?.message}>
                <Select value={watch('paymentMethod')?.toString() ?? '1'} onValueChange={(v) => setValue('paymentMethod', Number(v))}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          {/* Danh sách mặt hàng */}
          <FormSection icon={ShoppingCart} title="Mặt hàng">
            {typeof errors.items?.message === 'string' && (
              <p className="text-[11px] text-red-500 font-medium mb-2">{errors.items.message}</p>
            )}
            {errors.items?.root?.message && (
              <p className="text-[11px] text-red-500 font-medium mb-2">{errors.items.root.message}</p>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => {
                const itemType = Number(watch(`items.${index}.itemType`))
                const refId = Number(watch(`items.${index}.refId`))
                const qty = Number(watch(`items.${index}.quantity`) || 0)
                const lineDiscount = Number(watch(`items.${index}.discountAmount`) || 0)
                const unit = getUnitPrice(itemType, refId)
                const lineTotal = Math.max(unit * qty - lineDiscount, 0)
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="col-span-2">
                      <Label className="text-[11px] text-lotus-deep/70 mb-1 block">Loại *</Label>
                      <Select
                        value={watch(`items.${index}.itemType`)?.toString() ?? '1'}
                        onValueChange={(v) => { setValue(`items.${index}.itemType`, Number(v)); setValue(`items.${index}.refId`, 0) }}
                      >
                        <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ITEM_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Label className="text-[11px] text-lotus-deep/70 mb-1 block">Mặt hàng *</Label>
                      <SearchableSelect
                        value={refId ? String(refId) : ''}
                        onValueChange={(v) => setValue(`items.${index}.refId`, v ? Number(v) : 0)}
                        options={getOptionsForType(itemType)}
                        placeholder="Chọn mặt hàng"
                        searchPlaceholder="Tìm..."
                        className="h-9"
                      />
                      {errors.items?.[index]?.refId && (
                        <p className="text-[11px] text-red-500 mt-0.5">{errors.items[index]?.refId?.message}</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[11px] text-lotus-deep/70 mb-1 block">SL *</Label>
                      <Input {...register(`items.${index}.quantity`)} type="number" min={1} className="h-9 text-[13px]" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[11px] text-lotus-deep/70 mb-1 block">Giảm dòng</Label>
                      <Input {...register(`items.${index}.discountAmount`)} type="number" min={0} className="h-9 text-[13px]" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[11px] text-lotus-deep/70 mb-1 block">KTV</Label>
                      <SearchableSelect
                        value={watch(`items.${index}.staffId`)?.toString() ?? ''}
                        onValueChange={(v) => setValue(`items.${index}.staffId`, v ? Number(v) : undefined)}
                        options={staffs.map((s: StaffDto) => ({ value: String(s.id ?? ''), label: s.fullName ?? '' }))}
                        placeholder="—"
                        searchPlaceholder="Tìm KTV..."
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-1 flex items-end justify-center h-9 mt-5">
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="col-span-12 text-right text-[11px] text-lotus-stone">
                      Đơn giá: <strong>{fmt(unit)}</strong> · Thành tiền: <strong className="text-lotus-deep">{fmt(lineTotal)}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button type="button" variant="outline" size="sm"
              onClick={() => append({ itemType: INVOICE_ITEM_TYPE.SERVICE, refId: 0, quantity: 1, discountAmount: 0, staffId: undefined, note: '' })}
              className="mt-3 text-[12px] gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Thêm mặt hàng
            </Button>
          </FormSection>

          {/* Thanh toán */}
          <FormSection icon={Wallet} title="Thanh toán">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <FormField label="Giảm giá hóa đơn">
                <Input {...register('discountAmount')} type="number" min={0} className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Điểm sử dụng">
                <Input {...register('loyaltyPointsUsed')} type="number" min={0} className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Thuế (VAT)">
                <Input {...register('taxAmount')} type="number" min={0} className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Khách trả">
                <Input {...register('paidAmount')} type="number" min={0} className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Mã giao dịch">
                <Input {...register('transactionId')} placeholder="Mã CK / VNPay" className="h-9 text-[13px]" />
              </FormField>
              <FormField label="Áp dụng hạng thành viên">
                <Select
                  value={(watch('applyMembershipDiscount') ?? true) ? '1' : '0'}
                  onValueChange={(v) => setValue('applyMembershipDiscount', v === '1')}
                >
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Có</SelectItem>
                    <SelectItem value="0">Không</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Ghi chú" className="sm:col-span-3">
                <Textarea {...register('note')} placeholder="Ghi chú hóa đơn..." className="text-[13px] min-h-[50px] resize-none" />
              </FormField>
            </div>

            {/* Xem trước */}
            <div className="mt-4 rounded-lg bg-lotus-cream/40 border border-stone-200 p-3 text-[13px] space-y-1">
              <div className="flex justify-between"><span className="text-lotus-stone">Tạm tính</span><strong>{fmt(subTotal)}</strong></div>
              {manualDiscount > 0 && <div className="flex justify-between"><span className="text-lotus-stone">Giảm giá</span><span>-{fmt(manualDiscount)}</span></div>}
              {pointsValue > 0 && <div className="flex justify-between"><span className="text-lotus-stone">Điểm quy đổi</span><span>-{fmt(pointsValue)}</span></div>}
              {tax > 0 && <div className="flex justify-between"><span className="text-lotus-stone">Thuế</span><span>+{fmt(tax)}</span></div>}
              <div className="flex justify-between border-t border-stone-200 pt-1 text-[15px]">
                <span className="font-semibold text-lotus-deep">Tổng (ước tính)</span>
                <strong className="text-lotus-leaf">{fmt(totalPreview)}</strong>
              </div>
              <p className="text-[11px] text-lotus-stone italic pt-1">* Chưa gồm giảm giá hạng thành viên — số chính xác do hệ thống tính khi lưu.</p>
            </div>
          </FormSection>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>{COMMON_MSG.cancel}</Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>Lập hóa đơn</Button>
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

function FormField({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  const isRequired = label.includes('*')
  const cleanLabel = label.replace('*', '').trim()
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label className="text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}{isRequired && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ---- Default Values ----

function getDefaultValues(defaultSalonId?: number): InvoiceFormValues {
  return {
    customerId: undefined,
    customerName: '',
    customerPhone: '',
    salonId: defaultSalonId,
    discountAmount: 0,
    applyMembershipDiscount: true,
    loyaltyPointsUsed: 0,
    taxAmount: 0,
    paymentMethod: PAYMENT_METHOD.CASH,
    paidAmount: 0,
    transactionId: '',
    note: '',
    items: [],
  }
}
