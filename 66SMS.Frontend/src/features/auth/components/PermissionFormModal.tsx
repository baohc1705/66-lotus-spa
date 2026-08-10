import { useState } from 'react';
import { Button } from '@/shared/elements/Button';
import { FormField } from '@/shared/forms/FormField';
import { Input } from '@/shared/forms/Input';
import { Textarea } from '@/shared/forms/Textarea';
import { RolePermissionModal } from './RolePermissionModal';

export function PermissionFormModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: { id: number; name: string; resource: string; action: string; description?: string };
  onClose: () => void;
  onSave: (data: { name: string; resource: string; action: string; description: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [resource, setResource] = useState(initial?.resource ?? '');
  const [action, setAction] = useState(initial?.action ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const isEdit = !!initial;

  const canSave = name.trim() && resource.trim() && action.trim();

  function handleSave() {
    onSave({
      name: name.trim(),
      resource: resource.trim(),
      action: action.trim(),
      description: description.trim(),
    });
  }

  return (
    <RolePermissionModal
      title={isEdit ? 'Chỉnh sửa quyền' : 'Tạo quyền mới'}
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
            disabled={!canSave}
            loading={saving}
          >
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <FormField label="Tên quyền" required>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ví dụ: Xem danh sách người dùng"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Resource" required>
          <Input
            value={resource}
            onChange={(event) => setResource(event.target.value)}
            placeholder="users"
          />
        </FormField>
        <FormField label="Action" required>
          <Input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="read"
          />
        </FormField>
      </div>

      <FormField label="Mô tả">
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Mô tả quyền..."
          rows={3}
        />
      </FormField>
    </RolePermissionModal>
  );
}
