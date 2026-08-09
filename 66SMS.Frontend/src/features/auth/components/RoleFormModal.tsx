import { useState } from 'react';
import { Button } from '@/shared/elements/Button';
import { FormField } from '@/shared/forms/FormField';
import { Input } from '@/shared/forms/Input';
import { Textarea } from '@/shared/forms/Textarea';
import { RolePermissionModal } from './RolePermissionModal';

export function RoleFormModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: { name: string; description?: string };
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const isEdit = !!initial;

  function handleSave() {
    onSave(name.trim(), description.trim());
  }

  return (
    <RolePermissionModal
      title={isEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="outline-secondary"
            size="sm"
            className="mb-0! mr-0!"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="mb-0! mr-0!"
            onClick={handleSave}
            disabled={!name.trim()}
            loading={saving}
          >
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <FormField label="Tên vai trò" required>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ví dụ: admin"
        />
      </FormField>
      <FormField label="Mô tả">
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mô tả vai trò..."
          rows={3}
        />
      </FormField>
    </RolePermissionModal>
  );
}
