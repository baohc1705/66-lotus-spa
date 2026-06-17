import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useCreateStaffSalon, useUpdateStaffSalon } from '../hooks/useStaffSalons'
import {
  createStaffSalonSchema,
  updateStaffSalonSchema,
  type CreateStaffSalonFormValues,
  type UpdateStaffSalonFormValues,
} from '../schemas/staff-salon.schema'
import type { StaffSalonDTO } from '../types/staff-salon.types'
import { useStaffs } from '@/features/staffs/hooks/useStaffs'

interface StaffSalonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salonId: number
  staffSalon?: StaffSalonDTO | null
}

export function StaffSalonFormDialog({
  open,
  onOpenChange,
  salonId,
  staffSalon,
}: StaffSalonFormDialogProps) {
  const isEdit = !!staffSalon
  const createMutation = useCreateStaffSalon()
  const updateMutation = useUpdateStaffSalon()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { data: staffsData } = useStaffs({ pageIndex: 1, pageSize: 200 })
  const staffList = staffsData?.data?.items ?? []

  const createForm = useForm<CreateStaffSalonFormValues>({
    resolver: zodResolver(createStaffSalonSchema),
    defaultValues: { salonId, isManager: false, startDate: '' },
  })

  const updateForm = useForm<UpdateStaffSalonFormValues>({
    resolver: zodResolver(updateStaffSalonSchema),
  })

  useEffect(() => {
    if (staffSalon && isEdit) {
      updateForm.reset({
        isManager: staffSalon.isManager ?? false,
        startDate: staffSalon.startDate ?? '',
        endDate: staffSalon.endDate ?? '',
        status: staffSalon.status,
      })
    } else {
      createForm.reset({ salonId, isManager: false, startDate: '' })
    }
  }, [staffSalon, isEdit, salonId])

  function handleClose() {
    onOpenChange(false)
  }

  async function onCreateSubmit(values: CreateStaffSalonFormValues) {
    createMutation.mutate(
      {
        staffId: values.staffId,
        salonId: values.salonId,
        isManager: values.isManager,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        status: values.status,
      },
      { onSuccess: (r) => { if (r.isSuccess) handleClose() } },
    )
  }

  async function onUpdateSubmit(values: UpdateStaffSalonFormValues) {
    if (!staffSalon?.id) return
    updateMutation.mutate(
      { id: staffSalon.id, payload: values },
      { onSuccess: (r) => { if (r.isSuccess) handleClose() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Cập nhật nhân viên chi nhánh' : 'Gán nhân viên vào chi nhánh'}</DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
            <div className="flex items-center gap-3">
              <Label>Quản lý chi nhánh</Label>
              <Switch
                checked={updateForm.watch('isManager') ?? false}
                onCheckedChange={(v) => updateForm.setValue('isManager', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="u-startDate">Ngày bắt đầu</Label>
                <Input id="u-startDate" type="date" {...updateForm.register('startDate')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-endDate">Ngày kết thúc</Label>
                <Input id="u-endDate" type="date" {...updateForm.register('endDate')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={String(updateForm.watch('status') ?? '')}
                onValueChange={(v) => updateForm.setValue('status', Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không hoạt động</SelectItem>
                  <SelectItem value="1">Đang làm việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nhân viên</Label>
              <Select
                value={String(createForm.watch('staffId') ?? '')}
                onValueChange={(v) => createForm.setValue('staffId', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.fullName} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createForm.formState.errors.staffId && (
                <p className="text-xs text-red-500">{createForm.formState.errors.staffId.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Label>Quản lý chi nhánh</Label>
              <Switch
                checked={createForm.watch('isManager') ?? false}
                onCheckedChange={(v) => createForm.setValue('isManager', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-startDate">Ngày bắt đầu *</Label>
                <Input id="c-startDate" type="date" {...createForm.register('startDate')} />
                {createForm.formState.errors.startDate && (
                  <p className="text-xs text-red-500">{createForm.formState.errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-endDate">Ngày kết thúc</Label>
                <Input id="c-endDate" type="date" {...createForm.register('endDate')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang lưu...' : 'Gán nhân viên'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
