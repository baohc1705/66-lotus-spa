import { useState, useMemo } from 'react';
import type { RoleDTO, PermissionDTO } from '@/features/auth/types/auth.types';
import { useGetAllRoles } from '@/features/auth/hooks/useGetAllRoles';
import { useGetAllPermissions } from '@/features/auth/hooks/useGetAllPermissions';
import { useAssignPermissions } from '@/features/auth/hooks/useAssignPermissions';
import { useCreateRole } from '@/features/auth/hooks/useCreateRole';
import { useUpdateRole } from '@/features/auth/hooks/useUpdateRole';
import { useDeleteRole } from '@/features/auth/hooks/useDeleteRole';
import { useCreatePermission } from '@/features/auth/hooks/useCreatePermission';
import { useUpdatePermission } from '@/features/auth/hooks/useUpdatePermission';
import { useDeletePermission } from '@/features/auth/hooks/useDeletePermission';
import { groupByResource, getSortedActions } from '@/features/auth/components/rolePermissionHelpers';
import { RoleList } from '@/features/auth/components/RoleList';
import { PermissionMatrix } from '@/features/auth/components/PermissionMatrix';
import { PermissionListPanel } from '@/features/auth/components/PermissionListPanel';
import { RoleFormModal } from '@/features/auth/components/RoleFormModal';
import { PermissionFormModal } from '@/features/auth/components/PermissionFormModal';
import { RolePermissionConfirm } from '@/features/auth/components/RolePermissionConfirm';

type RoleModal = { type: 'createRole' } | { type: 'editRole'; role: RoleDTO } | null;
type PermModal = { type: 'createPerm' } | { type: 'editPerm'; perm: PermissionDTO } | null;
type DeleteTarget = { kind: 'role'; role: RoleDTO } | { kind: 'perm'; perm: PermissionDTO } | null;

export default function RolePermissionPage() {
  const rolesQuery = useGetAllRoles();
  const permissionsQuery = useGetAllPermissions();
  const assignMutation = useAssignPermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const createPermMutation = useCreatePermission();
  const updatePermMutation = useUpdatePermission();
  const deletePermMutation = useDeletePermission();

  const roles: RoleDTO[] = rolesQuery.data?.data ?? [];
  const allPermissions: PermissionDTO[] = permissionsQuery.data?.data ?? [];

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const activeRoleId = selectedRoleId ?? roles[0]?.id ?? null;
  const selectedRole = roles.find(r => r.id === activeRoleId) ?? null;

  const baseIds = useMemo(
    () => new Set<number>((selectedRole?.rolePermissions ?? []).map(rp => rp.permissionId)),
    [selectedRole],
  );
  const [edits, setEdits] = useState<Record<number, Set<number>>>({});
  const checkedIds: Set<number> = (activeRoleId !== null && edits[activeRoleId]) ? edits[activeRoleId] : baseIds;
  const isDirty = activeRoleId !== null && activeRoleId in edits;

  const [roleModal, setRoleModal] = useState<RoleModal>(null);
  const [permModal, setPermModal] = useState<PermModal>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  function togglePermission(permId: number) {
    if (activeRoleId === null) return;
    const current = edits[activeRoleId] ?? new Set(baseIds);
    const next = new Set(current);
    if (next.has(permId)) { next.delete(permId); } else { next.add(permId); }
    setEdits(prev => ({ ...prev, [activeRoleId]: next }));
  }

  function toggleResource(resource: string) {
    if (activeRoleId === null) return;
    const perms = grouped[resource] ?? [];
    const anyChecked = perms.some(p => checkedIds.has(p.id));
    const current = edits[activeRoleId] ?? new Set(baseIds);
    const next = new Set(current);
    if (anyChecked) {
      perms.forEach(p => next.delete(p.id));
    } else {
      perms.forEach(p => next.add(p.id));
    }
    setEdits(prev => ({ ...prev, [activeRoleId]: next }));
  }

  function handleSave() {
    if (!activeRoleId) return;
    assignMutation.mutate({ roleId: activeRoleId, permissionIds: Array.from(checkedIds) }, {
      onSuccess: () => {
        setEdits(prev => {
          const next = { ...prev };
          delete next[activeRoleId];
          return next;
        });
      },
    });
  }

  function handleUndo() {
    if (activeRoleId === null) return;
    setEdits(prev => {
      const next = { ...prev };
      delete next[activeRoleId];
      return next;
    });
  }

  function handleRoleSave(name: string, description: string) {
    if (roleModal?.type === 'createRole') {
      createRoleMutation.mutate({ name, description }, { onSuccess: (r) => { if (r.isSuccess) setRoleModal(null); } });
    } else if (roleModal?.type === 'editRole') {
      updateRoleMutation.mutate({ id: roleModal.role.id, name, description }, { onSuccess: (r) => { if (r.isSuccess) setRoleModal(null); } });
    }
  }

  function handlePermSave(data: { name: string; resource: string; action: string; description: string }) {
    if (permModal?.type === 'createPerm') {
      createPermMutation.mutate(data, { onSuccess: (r) => { if (r.isSuccess) setPermModal(null); } });
    } else if (permModal?.type === 'editPerm') {
      updatePermMutation.mutate({ id: permModal.perm.id, ...data }, { onSuccess: (r) => { if (r.isSuccess) setPermModal(null); } });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'role') {
      deleteRoleMutation.mutate(deleteTarget.role.id, {
        onSuccess: (r) => {
          if (r.isSuccess) {
            setDeleteTarget(null);
            if (activeRoleId === deleteTarget.role.id) setSelectedRoleId(null);
          }
        },
      });
    } else {
      deletePermMutation.mutate(deleteTarget.perm.id, { onSuccess: (r) => { if (r.isSuccess) setDeleteTarget(null); } });
    }
  }

  const grouped = groupByResource(allPermissions);
  const resources = Object.keys(grouped).sort();
  const actions = getSortedActions(allPermissions);
  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const roleSaving = createRoleMutation.isPending || updateRoleMutation.isPending;
  const permSaving = createPermMutation.isPending || updatePermMutation.isPending;
  const deleting = deleteRoleMutation.isPending || deletePermMutation.isPending;

  return (
    <div className="min-h-screen bg-adminGray-50 px-6 py-6 font-sans">
      <div className="fixed top-[-15vw] left-[-10vw] w-[40vw] h-[40vw] rounded-full bg-adminGreen-50 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15vw] right-[-10vw] w-[36vw] h-[36vw] rounded-full bg-adminGreen-600/6 blur-[90px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-adminInk m-0">Phân quyền theo vai trò</h1>
          <p className="text-sm text-adminGray-600 mt-1 mb-0">Quản lý vai trò, quyền hạn và gán quyền cho từng vai trò.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-adminGray-600">Đang tải dữ liệu...</div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              <RoleList
                roles={roles}
                activeRoleId={activeRoleId}
                onSelectRole={setSelectedRoleId}
                onCreateRole={() => setRoleModal({ type: 'createRole' })}
                onEditRole={role => setRoleModal({ type: 'editRole', role })}
                onDeleteRole={role => setDeleteTarget({ kind: 'role', role })}
              />

              <section className="flex-1 min-w-0">
                {selectedRole ? (
                  <PermissionMatrix
                    selectedRole={selectedRole}
                    allPermissions={allPermissions}
                    checkedIds={checkedIds}
                    grouped={grouped}
                    resources={resources}
                    actions={actions}
                    isDirty={isDirty}
                    isSaving={assignMutation.isPending}
                    onTogglePermission={togglePermission}
                    onToggleResource={toggleResource}
                    onSave={handleSave}
                    onUndo={handleUndo}
                  />
                ) : (
                  <div className="bg-white border border-border rounded-xl p-12 text-center text-adminGray-600 text-sm">
                    Chọn một vai trò bên trái để xem và chỉnh sửa quyền
                  </div>
                )}
              </section>
            </div>

            <PermissionListPanel
              permissions={allPermissions}
              onAdd={() => setPermModal({ type: 'createPerm' })}
              onEdit={p => setPermModal({ type: 'editPerm', perm: p })}
              onDelete={p => setDeleteTarget({ kind: 'perm', perm: p })}
            />
          </div>
        )}
      </div>

      {roleModal && (
        <RoleFormModal
          initial={roleModal.type === 'editRole' ? { name: roleModal.role.name, description: roleModal.role.desctiption } : undefined}
          onClose={() => setRoleModal(null)}
          onSave={handleRoleSave}
          saving={roleSaving}
        />
      )}
      {permModal && (
        <PermissionFormModal
          initial={permModal.type === 'editPerm' ? permModal.perm : undefined}
          onClose={() => setPermModal(null)}
          onSave={handlePermSave}
          saving={permSaving}
        />
      )}
      {deleteTarget && (
        <RolePermissionConfirm
          message={
            deleteTarget.kind === 'role'
              ? `Bạn có chắc muốn xóa vai trò "${deleteTarget.role.name}" không?`
              : `Bạn có chắc muốn xóa quyền "${deleteTarget.perm.name}" không?`
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
