import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { RoleDTO } from '@/features/auth/types/auth.types';
import { Button } from '@/shared/elements/Button';
import { Card, CardBody, CardTitle } from '@/shared/elements/Card';
import { ListGroup, ListGroupItem } from '@/shared/elements/ListGroup';
import { ROLE_COLORS } from './rolePermissionHelpers';

export function RoleList({
  roles,
  activeRoleId,
  onSelectRole,
  onCreateRole,
  onEditRole,
  onDeleteRole,
}: {
  roles: RoleDTO[];
  activeRoleId: number | null;
  onSelectRole: (id: number) => void;
  onCreateRole: () => void;
  onEditRole: (role: RoleDTO) => void;
  onDeleteRole: (role: RoleDTO) => void;
}) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col gap-2">
      <Button variant="primary" size="sm" block className="mb-0! mr-0!" onClick={onCreateRole}>
        <Plus className="mr-1 h-4 w-4" />
        Tạo vai trò
      </Button>

      <ListGroup>
        {roles.map((role: RoleDTO, index: number) => {
          const color = ROLE_COLORS[index % ROLE_COLORS.length];
          const isSelected = role.id === activeRoleId;
          const memberCount = role.roleUsers?.length ?? 0;
          const permissionCount = role.rolePermissions?.length ?? 0;

          return (
            <ListGroupItem
              key={role.id}
              active={isSelected}
              className="gap-2 px-3 py-2.5"
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-left"
                onClick={() => onSelectRole(role.id)}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-sm font-bold text-kit-white"
                  style={{ background: color.bg }}
                >
                  {role.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={
                      'truncate text-sm font-semibold ' +
                      (isSelected ? 'text-kit-white' : 'text-kit-heading')
                    }
                  >
                    {role.name}
                  </div>
                  <div
                    className={
                      'mt-0.5 text-xs ' + (isSelected ? 'text-kit-white/80' : 'text-kit-muted')
                    }
                  >
                    {memberCount} thành viên · {permissionCount} quyền
                  </div>
                </div>
              </button>

              <div className="flex shrink-0 flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={
                    'mb-0! mr-0! h-7 w-7 ' +
                    (isSelected
                      ? 'text-kit-white hover:bg-kit-white/15'
                      : 'text-kit-primary hover:bg-kit-page')
                  }
                  title="Sửa vai trò"
                  onClick={() => onEditRole(role)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={
                    'mb-0! mr-0! h-7 w-7 ' +
                    (isSelected
                      ? 'text-kit-white hover:bg-kit-white/15'
                      : 'text-kit-danger hover:bg-kit-page')
                  }
                  title="Xóa vai trò"
                  onClick={() => onDeleteRole(role)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>

      <Card className="mb-0! border border-kit">
        <CardBody className="p-3">
          <CardTitle className="mb-2 text-[10px] tracking-widest">Chú thích</CardTitle>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-kit-success" />
              <span className="text-xs text-kit-muted">Quyền được cấp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded border border-kit bg-kit-white" />
              <span className="text-xs text-kit-muted">Chưa cấp quyền</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-kit-warning" />
              <span className="text-xs text-kit-muted">Một phần</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </aside>
  );
}
