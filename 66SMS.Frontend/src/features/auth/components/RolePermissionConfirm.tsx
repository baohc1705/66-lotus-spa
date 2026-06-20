import { RolePermissionModal } from './RolePermissionModal';

export function RolePermissionConfirm({ message, onConfirm, onCancel, loading }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <RolePermissionModal title="Xác nhận xóa" onClose={onCancel}>
      <p className="text-sm text-lotus-stone mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded-lg border border-border bg-white text-lotus-deep font-semibold text-sm cursor-pointer hover:bg-lotus-cream"
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-lotus-error text-white font-semibold text-sm cursor-pointer border-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Đang xóa...' : 'Xóa'}
        </button>
      </div>
    </RolePermissionModal>
  );
}
