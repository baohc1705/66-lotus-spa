import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'default'
}

/**
 * ConfirmDialog - Dialog xác nhận reusable cho delete/destructive operations
 *
 * @example
 * <ConfirmDialog
 *   open={deleteOpen}
 *   onOpenChange={setDeleteOpen}
 *   onConfirm={() => deleteMutation.mutate(id)}
 *   title="Xóa nhân viên"
 *   description="Bạn có chắc muốn xóa nhân viên này? Hành động không thể hoàn tác."
 *   loading={deleteMutation.isPending}
 *   variant="danger"
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Xác nhận',
  description = 'Bạn có chắc muốn thực hiện hành động này?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  loading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-yellow-500' : 'text-lotus-leaf'
  const iconBg = variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-yellow-50' : 'bg-lotus-leaf/10'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
        <DialogHeader className="border-b-0 pb-0 mb-0">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="mt-1.5 text-[13px] leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t-0 mt-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
