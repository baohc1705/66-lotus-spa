import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button, type ButtonVariant } from "@/shared/elements/Button";

type ConfirmVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: ConfirmVariant;
}

const VARIANT_UI: Record<
  ConfirmVariant,
  {
    ring: string;
    confirmVariant: ButtonVariant;
  }
> = {
  danger: {
    ring: "border-kit-danger text-kit-danger",
    confirmVariant: "danger",
  },
  warning: {
    ring: "border-kit-warning text-kit-warning",
    confirmVariant: "warning",
  },
  default: {
    ring: "border-kit-primary text-kit-primary",
    confirmVariant: "primary",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Xác nhận",
  description = "Bạn có chắc muốn thực hiện hành động này?",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading = false,
  variant = "default",
}: ConfirmDialogProps) {
  const ui = VARIANT_UI[variant];

  function handleClose() {
    if (loading) return;
    onOpenChange(false);
  }

  return (
    <Modal open={open} onClose={handleClose} size="sm" centered>
      <div className="flex flex-col items-center px-2 py-2 text-center">
        <div
          className={
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 " +
            ui.ring
          }
        >
          {variant === "default" ? (
            <CircleCheck className="h-8 w-8" strokeWidth={2.25} />
          ) : (
            <span className="text-3xl font-bold leading-none">!</span>
          )}
        </div>

        <h3 className="mb-2 text-xl font-semibold text-kit-heading">{title}</h3>
        <div className="mb-6 max-w-sm text-sm leading-relaxed text-kit-muted">
          {description}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant={ui.confirmVariant}
            size="sm"
            className="mb-0! mr-0!"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="mb-0! mr-0!"
            disabled={loading}
            onClick={handleClose}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
