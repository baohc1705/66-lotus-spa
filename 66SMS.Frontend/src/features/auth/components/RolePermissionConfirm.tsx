import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

export function RolePermissionConfirm({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(open: boolean) => {
        if (!open) onCancel();
      }}
      onConfirm={onConfirm}
      title="Xác nhận xóa"
      description={message}
      confirmLabel="Xóa"
      cancelLabel="Hủy"
      loading={loading}
      variant="danger"
    />
  );
}
