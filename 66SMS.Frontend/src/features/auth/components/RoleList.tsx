import type { RoleDTO } from '@/features/auth/types/auth.types';
import { ROLE_COLORS } from './rolePermissionHelpers';

export function RoleList({ roles, activeRoleId, onSelectRole, onCreateRole, onEditRole, onDeleteRole }: {
  roles: RoleDTO[];
  activeRoleId: number | null;
  onSelectRole: (id: number) => void;
  onCreateRole: () => void;
  onEditRole: (role: RoleDTO) => void;
  onDeleteRole: (role: RoleDTO) => void;
}) {
  return (
    <aside className="w-[260px] shrink-0 flex flex-col gap-2">
      <button
        className="w-full py-2.5 rounded-lg bg-adminGreen-600 text-white font-semibold text-sm cursor-pointer border-0 hover:opacity-90"
        onClick={onCreateRole}
      >
        + Tạo vai trò
      </button>

      {roles.map((role, idx) => {
        const color = ROLE_COLORS[idx % ROLE_COLORS.length];
        const isSelected = role.id === activeRoleId;
        return (
          <div key={role.id} className="relative">
            <div
              onClick={() => onSelectRole(role.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                border: isSelected ? `1.5px solid ${color.bg}` : '1.5px solid var(--border)',
                background: isSelected ? color.light : 'var(--admin-bg-surface)',
                boxShadow: isSelected ? '0 2px 8px color-mix(in srgb, var(--admin-green-600) 20%, transparent)' : '0 1px 3px color-mix(in srgb, var(--admin-ink) 4%, transparent)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm"
                style={{ background: color.bg }}
              >
                {role.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-adminInk truncate">{role.name}</div>
                <div className="text-xs text-adminGray-600 mt-0.5">
                  {role.roleUsers?.length ?? 0} thành viên · {role.rolePermissions?.length ?? 0} quyền
                </div>
              </div>

              <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  title="Sửa vai trò"
                  onClick={() => onEditRole(role)}
                  className="bg-transparent border-0 cursor-pointer text-sm text-adminGreen-600 px-1 py-0.5 rounded hover:bg-adminGreen-50 leading-none"
                >
                  ✎
                </button>
                <button
                  title="Xóa vai trò"
                  onClick={() => onDeleteRole(role)}
                  className="bg-transparent border-0 cursor-pointer text-sm text-lotus-error px-1 py-0.5 rounded hover:bg-state-danger-bg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-1 bg-white border border-border rounded-xl p-3">
        <div className="text-2xs font-bold uppercase tracking-widest text-adminGray-600 mb-2">Chú thích</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-adminGreen-600 shrink-0" />
            <span className="text-xs text-adminGray-600">Quyền được cấp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border bg-white shrink-0" />
            <span className="text-xs text-adminGray-600">Chưa cấp quyền</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-adminGold-600 shrink-0" />
            <span className="text-xs text-adminGray-600">Một phần</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
