import { useState } from 'react';
import { RolePermissionModal } from './RolePermissionModal';

export function RoleFormModal({ initial, onClose, onSave, saving }: {
  initial?: { name: string; description?: string };
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const isEdit = !!initial;

  return (
    <RolePermissionModal title={isEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-adminGray-600 mb-1">Tên vai trò *</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-adminInk text-sm outline-none focus:border-adminGreen-600 transition-colors"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: admin"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-adminGray-600 mb-1">Mô tả</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-adminInk text-sm outline-none focus:border-adminGreen-600 transition-colors resize-y min-h-[72px]"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Mô tả vai trò..."
          />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            className="px-4 py-2 rounded-lg border border-border bg-white text-adminInk font-semibold text-sm cursor-pointer hover:bg-adminGray-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-adminGreen-600 text-white font-semibold text-sm cursor-pointer border-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onSave(name.trim(), desc.trim())}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
      </div>
    </RolePermissionModal>
  );
}
