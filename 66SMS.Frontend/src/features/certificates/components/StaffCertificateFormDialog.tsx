import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Image as ImageIcon, X } from 'lucide-react'
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
import { useCreateStaffCertificate, useUpdateStaffCertificate } from '../hooks/useStaffCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { useStaffs } from '@/features/staffs/hooks/useStaffs'
import { uploadApi } from '@/shared/api/upload.api'
import type { StaffDto } from '@/features/staffs/types/staff.types'
import type { StaffCertificateDTO, CertificateTypeDTO } from '../types/certificate.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: StaffCertificateDTO | null
  staffId?: number
}

interface FormValues {
  staffId: number
  certificateTypeId: number
  certificateName: string
  certificateNumber: string
  issuingOrganization: string
  issuedDate: string
  expiryDate: string
  documentUrl: string
  note: string
  status: number
}

function getDefaults(item?: StaffCertificateDTO | null, staffId?: number): FormValues {
  return {
    staffId: item?.staffId ?? staffId ?? 0,
    certificateTypeId: item?.certificateTypeId ?? 0,
    certificateName: item?.certificateName ?? '',
    certificateNumber: item?.certificateNumber ?? '',
    issuingOrganization: item?.issuingOrganization ?? '',
    issuedDate: item?.issuedDate ? item.issuedDate.slice(0, 10) : '',
    expiryDate: item?.expiryDate ? item.expiryDate.slice(0, 10) : '',
    documentUrl: item?.documentUrl ?? '',
    note: item?.note ?? '',
    status: item?.status ?? 0,
  }
}

const STATUS_OPTIONS = [
  { value: '0', label: 'Chờ xác minh' },
  { value: '1', label: 'Đang hiệu lực' },
  { value: '2', label: 'Hết hạn' },
  { value: '3', label: 'Đã thu hồi' },
]

export function StaffCertificateFormDialog({ open, onOpenChange, item, staffId }: Props) {
  const isEdit = !!item
  const createMutation = useCreateStaffCertificate()
  const updateMutation = useUpdateStaffCertificate()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Ảnh scan chứng chỉ: lưu file đang chờ upload + ảnh xem trước
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const typesQuery = useCertificateTypes({ pageIndex: 1, pageSize: 100 })
  const types = typesQuery.data?.data?.items ?? []

  // Chỉ cần chọn nhân viên khi thêm mới và không bị khóa staffId từ trang chi tiết nhân viên
  const showStaffSelect = !isEdit && !staffId
  const staffsQuery = useStaffs({ pageIndex: 1, pageSize: 100 })
  const staffs = staffsQuery.data?.data?.items ?? []

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError } = useForm<FormValues>({
    defaultValues: getDefaults(item, staffId),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaults(item, staffId))
      setPendingFile(null)
      setPreview(item?.documentUrl ?? '')
    }
  }, [open, item, staffId, reset])

  const onSubmit = async (data: FormValues) => {
    if (!isEdit && showStaffSelect && (!data.staffId || data.staffId <= 0)) {
      setError('staffId', { message: 'Vui lòng chọn nhân viên' })
      return
    }

    // Upload ảnh scan chứng chỉ lên server nếu có file mới được chọn
    let documentUrl = data.documentUrl || undefined
    if (pendingFile) {
      setIsUploading(true)
      try {
        const result = await uploadApi.uploadImage(pendingFile, 'certificate')
        if (result.isSuccess && result.data) documentUrl = result.data
      } finally {
        setIsUploading(false)
      }
    }

    if (isEdit && item?.id) {
      const payload = {
        certificateTypeId: data.certificateTypeId,
        certificateName: data.certificateName,
        certificateNumber: data.certificateNumber || undefined,
        issuingOrganization: data.issuingOrganization,
        issuedDate: data.issuedDate,
        expiryDate: data.expiryDate || undefined,
        documentUrl,
        note: data.note || undefined,
        status: data.status,
      }
      updateMutation.mutate(
        { id: item.id, payload },
        { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) } }
      )
    } else {
      const payload = {
        staffId: data.staffId,
        certificateTypeId: data.certificateTypeId,
        certificateName: data.certificateName,
        certificateNumber: data.certificateNumber || undefined,
        issuingOrganization: data.issuingOrganization,
        issuedDate: data.issuedDate,
        expiryDate: data.expiryDate || undefined,
        documentUrl,
        note: data.note || undefined,
        status: data.status,
      }
      createMutation.mutate(payload, {
        onSuccess: (result) => { if (result.isSuccess) onOpenChange(false) }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ nhân viên'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Cập nhật thông tin chứng chỉ "${item?.certificateName ?? ''}"` : 'Điền thông tin chứng chỉ của nhân viên'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showStaffSelect && (
            <FormField label="Nhân viên *" error={errors.staffId?.message}>
              <Select
                value={watch('staffId') ? watch('staffId').toString() : undefined}
                onValueChange={(v) => setValue('staffId', Number(v))}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {staffs.map((s: StaffDto) => (
                    <SelectItem key={s.id} value={s.id!.toString()}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Loại chứng chỉ *" error={errors.certificateTypeId?.message}>
              <Select
                value={watch('certificateTypeId')?.toString()}
                onValueChange={(v) => setValue('certificateTypeId', Number(v))}
              >
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn loại chứng chỉ" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t: CertificateTypeDTO) => (
                    <SelectItem key={t.id} value={t.id!.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Trạng thái">
              <Select value={watch('status')?.toString()} onValueChange={(v) => setValue('status', Number(v))}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Tên chứng chỉ *" error={errors.certificateName?.message}>
            <Input {...register('certificateName', { required: 'Tên chứng chỉ là bắt buộc' })} placeholder="Chứng chỉ Massage Trị liệu Quốc tế" className="h-9 text-[13px]" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Số chứng chỉ">
              <Input {...register('certificateNumber')} placeholder="VN-2024-12345" className="h-9 text-[13px]" />
            </FormField>
            <FormField label="Tổ chức cấp *" error={errors.issuingOrganization?.message}>
              <Input {...register('issuingOrganization', { required: 'Tổ chức cấp là bắt buộc' })} placeholder="Bộ Y tế / CIDESCO" className="h-9 text-[13px]" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Ngày cấp *" error={errors.issuedDate?.message}>
              <Input {...register('issuedDate', { required: 'Ngày cấp là bắt buộc' })} type="date" className="h-9 text-[13px]" />
            </FormField>
            <FormField label="Ngày hết hạn (để trống nếu không hết hạn)">
              <Input {...register('expiryDate')} type="date" className="h-9 text-[13px]" />
            </FormField>
          </div>

          <FormField label="Ảnh scan chứng chỉ">
            <div className="flex items-start gap-3">
              <div className="relative group/card">
                <button
                  type="button"
                  onClick={() => document.getElementById('certificate-scan')?.click()}
                  className={[
                    'h-[120px] w-[160px] rounded-lg overflow-hidden transition-all',
                    preview
                      ? 'border border-stone-200 hover:border-lotus-leaf/60'
                      : 'border-2 border-dashed border-stone-300 bg-stone-50 hover:border-lotus-leaf hover:bg-lotus-leaf/5',
                  ].join(' ')}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Ảnh chứng chỉ" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone-400 group-hover/card:text-lotus-leaf transition-colors">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[11px] font-medium">Chọn ảnh</span>
                    </div>
                  )}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingFile(null)
                      setPreview('')
                      setValue('documentUrl', '')
                    }}
                    className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-lotus-stone mt-1">
                Tải ảnh scan/chụp chứng chỉ (JPG, PNG, WEBP).
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                id="certificate-scan"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setPendingFile(file)
                  setPreview(URL.createObjectURL(file))
                }}
              />
            </div>
          </FormField>

          <FormField label="Ghi chú">
            <Textarea {...register('note')} placeholder="Ghi chú thêm..." className="text-[13px] min-h-[64px]" />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending || isUploading}>
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending || isUploading}>
              {isEdit ? 'Cập nhật' : 'Thêm chứng chỉ'}
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
