import { useState } from 'react';
import { RolePermissionModal } from './RolePermissionModal';

export function PermissionFormModal({ initial, onClose, onSave, saving }: {
  initial?: { id: number; name: string; resource: string; action: string; description?: string };
  onClose: () => void;
  onSave: (data: { name: string; resource: string; action: string; description: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [resource, setResource] = useState(initial?.resource ?? '');
  const [action, setAction] = useState(initial?.action ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const isEdit = !!initial;

  return (
    <RolePermissionModal title={isEdit ? 'Chỉnh sửa quyền' : 'Tạo quyền mới'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-lotus-stone mb-1">Tên quyền *</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-lotus-deep text-sm outline-none focus:border-lotus-leaf transition-colors"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Xem danh sách người dùng"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-lotus-stone mb-1">Resource *</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-lotus-deep text-sm outline-none focus:border-lotus-leaf transition-colors"
              value={resource}
              onChange={e => setResource(e.target.value)}
              placeholder="users"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-lotus-stone mb-1">Action *</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-lotus-deep text-sm outline-none focus:border-lotus-leaf transition-colors"
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="read"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-lotus-stone mb-1">Mô tả</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-lotus-deep text-sm outline-none focus:border-lotus-leaf transition-colors resize-y min-h-[60px]"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Mô tả quyền..."
          />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="px-4 py-2 rounded-lg border border-border bg-white text-lotus-deep font-semibold text-sm cursor-pointer hover:bg-lotus-cream"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-lotus-leaf text-white font-semibold text-sm cursor-pointer border-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onSave({ name: name.trim(), resource: resource.trim(), action: action.trim(), description: desc.trim() })}
            disabled={!name.trim() || !resource.trim() || !action.trim() || saving}
          >
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
      </div>
    </RolePermissionModal>
  );
}
