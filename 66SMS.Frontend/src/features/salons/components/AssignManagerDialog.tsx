import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useAssignManager } from '@/features/staff_salons/hooks/useStaffSalons'
import { useStaffs } from '@/features/staffs/hooks/useStaffs'

const schema = z.object({
  staffId: z.number({ required_error: 'Vui lòng chọn nhân viên' }).min(1, 'Vui lòng chọn nhân viên'),
})
type FormValues = z.infer<typeof schema>

interface AssignManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salonId: number
}

export function AssignManagerDialog({ open, onOpenChange, salonId }: AssignManagerDialogProps) {
  const { mutate: assignManager, isPending } = useAssignManager()

  const { data: staffsData } = useStaffs({ pageIndex: 1, pageSize: 200 })
  const staffList = staffsData?.data?.items ?? []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  function onSubmit(values: FormValues) {
    assignManager(
      { staffId: values.staffId, salonId },
      { onSuccess: (r) => { if (r.isSuccess) handleClose() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Phân công Quản lý Chi nhánh</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nhân viên *</Label>
            <Select
              value={String(watch('staffId') ?? '')}
              onValueChange={(v) => setValue('staffId', Number(v), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffId && (
              <p className="text-xs text-red-500">{errors.staffId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Phân công ✓'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
