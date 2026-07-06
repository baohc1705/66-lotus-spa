import type { RoleDTO, PermissionDTO } from '@/features/auth/types/auth.types';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PermissionMatrix({ selectedRole, allPermissions, checkedIds, grouped, resources, actions, isDirty, isSaving, onTogglePermission, onToggleResource, onSave, onUndo }: {
  selectedRole: RoleDTO;
  allPermissions: PermissionDTO[];
  checkedIds: Set<number>;
  grouped: Record<string, PermissionDTO[]>;
  resources: string[];
  actions: string[];
  isDirty: boolean;
  isSaving: boolean;
  onTogglePermission: (permId: number) => void;
  onToggleResource: (resource: string) => void;
  onSave: () => void;
  onUndo: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Role card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="h-1.5 bg-lotus-leaf" />
        <div className="px-4 py-3.5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl shrink-0 bg-lotus-leaf text-white font-bold text-lg flex items-center justify-center">
            {selectedRole.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-lotus-deep mb-0.5">{selectedRole.name}</h2>
            <p className="text-xs text-lotus-stone">{selectedRole.desctiption || 'Không có mô tả'}</p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <div className="text-center bg-lotus-cream border border-border rounded-lg px-3.5 py-1.5">
              <div className="text-base font-bold text-lotus-deep leading-none">{selectedRole.roleUsers?.length ?? 0}</div>
              <div className="text-lotus-admin-xs text-lotus-stone mt-0.5">thành viên</div>
            </div>
            <div className="text-center bg-[rgba(62,122,62,0.06)] border border-lotus-leaf/30 rounded-lg px-3.5 py-1.5">
              <div className="text-base font-bold text-lotus-leaf leading-none">{checkedIds.size}</div>
              <div className="text-lotus-admin-xs text-lotus-stone mt-0.5">quyền</div>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm font-bold text-lotus-deep">Ma trận quyền</div>
        </div>

        {allPermissions.length === 0 ? (
          <p className="p-6 text-center text-lotus-stone text-sm">Chưa có quyền nào — hãy tạo quyền ở bảng bên dưới</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-lotus-cream">
                  <th className="px-3.5 py-2.5 text-left text-lotus-admin-base font-bold text-lotus-stone uppercase tracking-wide border-b border-border w-44">
                    Tài nguyên
                  </th>
                  <th className="px-2 py-2.5 text-center text-lotus-admin-base font-bold text-lotus-stone uppercase tracking-wide border-b border-border min-w-[70px]">
                    Tất cả
                  </th>
                  {actions.map(a => (
                    <th key={a} className="px-2 py-2.5 text-center text-lotus-admin-base font-bold text-lotus-stone uppercase tracking-wide border-b border-border min-w-[76px]">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((resource, ri) => {
                  const resourcePerms = grouped[resource] ?? [];
                  const allChecked = resourcePerms.length > 0 && resourcePerms.every(p => checkedIds.has(p.id));
                  const someChecked = !allChecked && resourcePerms.some(p => checkedIds.has(p.id));

                  return (
                    <tr key={resource} className={ri % 2 === 0 ? 'bg-white' : 'bg-lotus-cream/30'}>
                      <td className="px-3.5 py-2.5 text-sm font-semibold text-lotus-deep border-b border-border">
                        {resource}
                      </td>

                      {/* Select-all for this resource */}
                      <td className="px-2 py-2.5 text-center border-b border-border">
                        <button
                          onClick={() => onToggleResource(resource)}
                          title={allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[5px] cursor-pointer border-0 transition-all"
                          style={{
                            background: allChecked ? '#3E7A3E' : someChecked ? '#f59e0b' : '#fff',
                            border: allChecked || someChecked ? 'none' : '1.5px solid rgb(var(--border))',
                            boxShadow: allChecked ? '0 1px 4px rgba(62,122,62,.35)' : someChecked ? '0 1px 4px rgba(245,158,11,.35)' : 'none',
                          }}
                        >
                          {allChecked && <CheckIcon />}
                          {someChecked && <DashIcon />}
                        </button>
                      </td>

                      {actions.map(act => {
                        const perm = grouped[resource]?.find(p => p.action.toLowerCase() === act);
                        if (!perm) return (
                          <td key={act} className="px-2 py-2.5 text-center border-b border-border">
                            <span className="inline-block w-5 h-5 rounded-[5px] bg-lotus-cream" />
                          </td>
                        );
                        const checked = checkedIds.has(perm.id);
                        return (
                          <td key={act} className="px-2 py-2.5 text-center border-b border-border">
                            <button
                              onClick={() => onTogglePermission(perm.id)}
                              title={perm.name}
                              className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[5px] cursor-pointer border-0 transition-all"
                              style={{
                                background: checked ? '#3E7A3E' : '#fff',
                                border: checked ? 'none' : '1.5px solid rgb(var(--border))',
                                boxShadow: checked ? '0 1px 4px rgba(62,122,62,.35)' : 'none',
                              }}
                            >
                              {checked && <CheckIcon />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex justify-end gap-2.5">
        {isDirty && (
          <button
            className="px-4 py-2 rounded-lg border border-border bg-white text-lotus-deep font-semibold text-sm cursor-pointer hover:bg-lotus-cream"
            onClick={onUndo}
          >
            Hoàn tác
          </button>
        )}
        <button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="px-5 py-2 rounded-lg text-white font-semibold text-sm border-0 transition-colors disabled:cursor-not-allowed"
          style={{ background: isDirty ? '#3E7A3E' : '#C5D9C5', cursor: isDirty ? 'pointer' : 'not-allowed' }}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}
