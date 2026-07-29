import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Image as ImageIcon, X, ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'


import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui/select'
import { FormSection } from '@/shared/components/forms/FormSection'
import { FormField } from '@/shared/components/forms/FormField'
import { useCreateStaffCertificate, useUpdateStaffCertificate } from '../hooks/useStaffCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { useStaffs } from '@/features/staffs/hooks/useStaffs'
import { fileToBase64 } from '@/shared/lib/fileToBase64'
import { parseToDateInput } from '@/shared/utils/date.utils'
import type { StaffDto } from '@/features/staffs/types/staff.types'
import { createStaffCertificateSchema, type StaffCertificateFormValues } from '../schemas/staffCertificate.schema'
import type { StaffCertificateDTO, CertificateTypeDTO } from '../types/certificate.types'
import { COMMON_MSG } from '@/shared/constants/common.messages'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: StaffCertificateDTO | null
  staffId?: number
}

function getDefaults(item?: StaffCertificateDTO | null, staffId?: number): StaffCertificateFormValues {
  return {
    staffId: item?.staffId ?? staffId ?? 0,
    certificateTypeId: item?.certificateTypeId ?? 0,
    certificateName: item?.certificateName ?? '',
    certificateNumber: item?.certificateNumber ?? '',
    issuingOrganization: item?.issuingOrganization ?? '',
    issuedDate: parseToDateInput(item?.issuedDate),
    expiryDate: parseToDateInput(item?.expiryDate),
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

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const typesQuery = useCertificateTypes({ pageIndex: 1, pageSize: 100 })
  const types = typesQuery.data?.data?.items ?? []

  const showStaffSelect = !isEdit && !staffId
  const staffsQuery = useStaffs({ pageIndex: 1, pageSize: 100 })
  const staffs = staffsQuery.data?.data?.items ?? []

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError } = useForm<StaffCertificateFormValues>({
    resolver: zodResolver(createStaffCertificateSchema) as Resolver<StaffCertificateFormValues>,
    defaultValues: getDefaults(item, staffId),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaults(item, staffId))
      setPendingFile(null)
      setPreview(item?.documentUrl ?? '')
    }
  }, [open, item, staffId, reset])

  const onSubmit = async (data: StaffCertificateFormValues) => {
    if (!isEdit && showStaffSelect && (!data.staffId || data.staffId <= 0)) {
      setError('staffId', { message: 'Vui lòng chọn nhân viên' })
      return
    }

    let imageBase64: string | undefined
    if (pendingFile) {
      setIsUploading(true)
      try {
        imageBase64 = await fileToBase64(pendingFile)
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
        documentUrl: data.documentUrl || undefined,
        imageBase64,
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
        documentUrl: data.documentUrl || undefined,
        imageBase64,
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
          <FormSection icon={ShieldCheck} title="Thông tin chứng chỉ">
            <div className="space-y-4">
              {showStaffSelect && (
                <FormField label="Nhân viên *" error={errors.staffId?.message}>
                  <Select
                    value={watch('staffId') ? watch('staffId').toString() : undefined}
                    onValueChange={(v) => setValue('staffId', Number(v))}
                  >
                    <AdminSelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </AdminSelectTrigger>
                    <SelectContent>
                      {staffs.map((s: StaffDto) => (
                        <SelectItem key={s.id} value={s.id!.toString()}>{s.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Loại chứng chỉ *" error={errors.certificateTypeId?.message}>
                  <Select
                    value={watch('certificateTypeId')?.toString() ?? ''}
                    onValueChange={(v) => setValue('certificateTypeId', Number(v))}
                  >
                    <AdminSelectTrigger>
                      <SelectValue placeholder="Chọn loại chứng chỉ" />
                    </AdminSelectTrigger>
                    <SelectContent>
                      {types.map((t: CertificateTypeDTO) => (
                        <SelectItem key={t.id} value={t.id!.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Trạng thái" error={errors.status?.message}>
                  <Select value={watch('status')?.toString()} onValueChange={(v) => setValue('status', Number(v))}>
                    <AdminSelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </AdminSelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Tên chứng chỉ *" error={errors.certificateName?.message}>
                <AdminInput {...register('certificateName')} placeholder="Chứng chỉ Massage Trị liệu Quốc tế" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Số chứng chỉ" error={errors.certificateNumber?.message}>
                  <AdminInput {...register('certificateNumber')} placeholder="VN-2024-12345" />
                </FormField>
                <FormField label="Tổ chức cấp *" error={errors.issuingOrganization?.message}>
                  <AdminInput {...register('issuingOrganization')} placeholder="Bộ Y tế / CIDESCO" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Ngày cấp *" error={errors.issuedDate?.message}>
                  <AdminInput {...register('issuedDate')} type="date" />
                </FormField>
                <FormField label="Ngày hết hạn (để trống nếu không hết hạn)" error={errors.expiryDate?.message}>
                  <AdminInput {...register('expiryDate')} type="date" />
                </FormField>
              </div>

              <FormField label="Ảnh scan chứng chỉ" error={errors.documentUrl?.message}>
                <div className="flex items-start gap-3">
                  <div className="relative group/card">
                    <button
                      type="button"
                      onClick={() => document.getElementById('certificate-scan')?.click()}
                      className={[
                        'h-[120px] w-[160px] rounded-lg overflow-hidden transition-all',
                        preview
                          ? 'border border-adminGray-100 hover:border-adminGreen-600/60'
                          : 'border-2 border-dashed border-adminGray-300 bg-adminGray-50 hover:border-adminGreen-600 hover:bg-adminGreen-50',
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
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-adminGray-400 group-hover/card:text-adminGreen-600 transition-colors">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-xs font-medium">Chọn ảnh</span>
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
                        className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 rounded-full bg-state-danger-solid text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-state-danger-solid shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-adminGray-600 mt-1">
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

              <FormField label="Ghi chú" error={errors.note?.message}>
                <AdminTextarea {...register('note')} placeholder="Ghi chú thêm..." className="text-sm min-h-[64px]" />
              </FormField>
            </div>
          </FormSection>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending || isUploading}>
              {COMMON_MSG.cancel}
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
