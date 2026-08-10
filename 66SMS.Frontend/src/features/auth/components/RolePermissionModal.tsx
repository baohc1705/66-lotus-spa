import type { ReactNode } from 'react';
import { Modal } from '@/shared/components/Modal';

export function RolePermissionModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Modal open onClose={onClose} title={title} size="md" centered footer={footer}>
      {children}
    </Modal>
  );
}
