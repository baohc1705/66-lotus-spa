import { useState, useMemo } from 'react';
import type {
  RoleDTO,
  PermissionDTO,
  RolePermissionDTO,
} from '@/features/auth/types/auth.types';
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
import { Card, CardBody } from '@/shared/elements/Card';

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
  const selectedRole = roles.find((role: RoleDTO) => role.id === activeRoleId) ?? null;

  const baseIds = useMemo(
    () =>
      new Set<number>(
        (selectedRole?.rolePermissions ?? []).map(
          (rolePermission: RolePermissionDTO) => rolePermission.permissionId,
        ),
      ),
    [selectedRole],
  );
  const [edits, setEdits] = useState<Record<number, Set<number>>>({});
  const checkedIds: Set<number> =
    activeRoleId !== null && edits[activeRoleId] ? edits[activeRoleId] : baseIds;
  const isDirty = activeRoleId !== null && activeRoleId in edits;

  const [roleModal, setRoleModal] = useState<RoleModal>(null);
  const [permModal, setPermModal] = useState<PermModal>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  function togglePermission(permissionId: number) {
    if (activeRoleId === null) return;
    const current = edits[activeRoleId] ?? new Set(baseIds);
    const next = new Set(current);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    setEdits((prev) => ({ ...prev, [activeRoleId]: next }));
  }

  function toggleResource(resource: string) {
    if (activeRoleId === null) return;
    const resourcePermissions = grouped[resource] ?? [];
    const anyChecked = resourcePermissions.some((permission: PermissionDTO) =>
      checkedIds.has(permission.id),
    );
    const current = edits[activeRoleId] ?? new Set(baseIds);
    const next = new Set(current);
    if (anyChecked) {
      resourcePermissions.forEach((permission: PermissionDTO) => next.delete(permission.id));
    } else {
      resourcePermissions.forEach((permission: PermissionDTO) => next.add(permission.id));
    }
    setEdits((prev) => ({ ...prev, [activeRoleId]: next }));
  }

  function handleSave() {
    if (!activeRoleId) return;
    assignMutation.mutate(
      { roleId: activeRoleId, permissionIds: Array.from(checkedIds) },
      {
        onSuccess: () => {
          setEdits((prev) => {
            const next = { ...prev };
            delete next[activeRoleId];
            return next;
          });
        },
      },
    );
  }

  function handleUndo() {
    if (activeRoleId === null) return;
    setEdits((prev) => {
      const next = { ...prev };
      delete next[activeRoleId];
      return next;
    });
  }

  function handleRoleSave(name: string, description: string) {
    if (roleModal?.type === 'createRole') {
      createRoleMutation.mutate(
        { name, description },
        {
          onSuccess: (result) => {
            if (result.isSuccess) setRoleModal(null);
          },
        },
      );
    } else if (roleModal?.type === 'editRole') {
      updateRoleMutation.mutate(
        { id: roleModal.role.id, name, description },
        {
          onSuccess: (result) => {
            if (result.isSuccess) setRoleModal(null);
          },
        },
      );
    }
  }

  function handlePermSave(data: {
    name: string;
    resource: string;
    action: string;
    description: string;
  }) {
    if (permModal?.type === 'createPerm') {
      createPermMutation.mutate(data, {
        onSuccess: (result) => {
          if (result.isSuccess) setPermModal(null);
        },
      });
    } else if (permModal?.type === 'editPerm') {
      updatePermMutation.mutate(
        { id: permModal.perm.id, ...data },
        {
          onSuccess: (result) => {
            if (result.isSuccess) setPermModal(null);
          },
        },
      );
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'role') {
      deleteRoleMutation.mutate(deleteTarget.role.id, {
        onSuccess: (result) => {
          if (result.isSuccess) {
            setDeleteTarget(null);
            if (activeRoleId === deleteTarget.role.id) setSelectedRoleId(null);
          }
        },
      });
    } else {
      deletePermMutation.mutate(deleteTarget.perm.id, {
        onSuccess: (result) => {
          if (result.isSuccess) setDeleteTarget(null);
        },
      });
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
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <div className="mb-5">
        <h1 className="m-0 text-xl font-bold text-kit-heading">Phân quyền theo vai trò</h1>
        <p className="mb-0 mt-1 text-sm text-kit-muted">
          Quản lý vai trò, quyền hạn và gán quyền cho từng vai trò.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-kit-muted">Đang tải dữ liệu...</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <RoleList
              roles={roles}
              activeRoleId={activeRoleId}
              onSelectRole={setSelectedRoleId}
              onCreateRole={() => setRoleModal({ type: 'createRole' })}
              onEditRole={(role: RoleDTO) => setRoleModal({ type: 'editRole', role })}
              onDeleteRole={(role: RoleDTO) => setDeleteTarget({ kind: 'role', role })}
            />

            <section className="min-w-0 flex-1">
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
                <Card className="mb-0! border border-kit">
                  <CardBody className="p-12 text-center text-sm text-kit-muted">
                    Chọn một vai trò bên trái để xem và chỉnh sửa quyền
                  </CardBody>
                </Card>
              )}
            </section>
          </div>

          <PermissionListPanel
            permissions={allPermissions}
            onAdd={() => setPermModal({ type: 'createPerm' })}
            onEdit={(permission: PermissionDTO) =>
              setPermModal({ type: 'editPerm', perm: permission })
            }
            onDelete={(permission: PermissionDTO) =>
              setDeleteTarget({ kind: 'perm', perm: permission })
            }
          />
        </div>
      )}

      {roleModal ? (
        <RoleFormModal
          initial={
            roleModal.type === 'editRole'
              ? { name: roleModal.role.name, description: roleModal.role.desctiption }
              : undefined
          }
          onClose={() => setRoleModal(null)}
          onSave={handleRoleSave}
          saving={roleSaving}
        />
      ) : null}

      {permModal ? (
        <PermissionFormModal
          initial={permModal.type === 'editPerm' ? permModal.perm : undefined}
          onClose={() => setPermModal(null)}
          onSave={handlePermSave}
          saving={permSaving}
        />
      ) : null}

      {deleteTarget ? (
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
      ) : null}
    </div>
  );
}
