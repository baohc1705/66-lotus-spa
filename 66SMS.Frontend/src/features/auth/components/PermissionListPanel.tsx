import type { PermissionDTO } from '@/features/auth/types/auth.types';

export function PermissionListPanel({ permissions, onAdd, onEdit, onDelete }: {
  permissions: PermissionDTO[];
  onAdd: () => void;
  onEdit: (p: PermissionDTO) => void;
  onDelete: (p: PermissionDTO) => void;
}) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="text-sm font-bold text-lotus-deep">
          Quản lý quyền hệ thống
          <span className="ml-2 text-xs font-medium text-lotus-stone">{permissions.length} quyền</span>
        </div>
        <button
          className="px-3 py-1.5 rounded-lg bg-lotus-leaf text-white font-semibold text-xs cursor-pointer border-0 hover:opacity-90"
          onClick={onAdd}
        >
          + Tạo quyền
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto overflow-x-auto w-full">
        {permissions.length === 0 ? (
          <p className="p-6 text-center text-lotus-stone text-sm">Chưa có quyền nào</p>
        ) : (
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-lotus-cream">
                {['Tên quyền', 'Resource', 'Action', ''].map(h => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[11px] font-bold text-lotus-stone uppercase tracking-wide border-b border-border"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-lotus-cream/40'}>
                  <td className="px-3 py-2 text-xs font-semibold text-lotus-deep border-b border-border">{p.name}</td>
                  <td className="px-3 py-2 border-b border-border">
                    <span className="text-[11px] bg-[rgba(62,122,62,0.1)] text-lotus-leaf rounded px-2 py-0.5 font-semibold">{p.resource}</span>
                  </td>
                  <td className="px-3 py-2 border-b border-border">
                    <span className="text-[11px] bg-lotus-cream text-lotus-stone rounded px-2 py-0.5 font-semibold">{p.action}</span>
                  </td>
                  <td className="px-3 py-2 border-b border-border text-right whitespace-nowrap">
                    <button
                      className="text-xs text-lotus-leaf font-semibold mr-3 bg-transparent border-0 cursor-pointer hover:underline"
                      onClick={() => onEdit(p)}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-xs text-lotus-error font-semibold bg-transparent border-0 cursor-pointer hover:underline"
                      onClick={() => onDelete(p)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
