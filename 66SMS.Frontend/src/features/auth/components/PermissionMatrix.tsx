import type { RoleDTO, PermissionDTO } from '@/features/auth/types/auth.types';
import { Button } from '@/shared/elements/Button';
import { Card, CardBody, CardHeader } from '@/shared/elements/Card';
import { cn } from '@/lib/utils';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6l3 3 5-5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

export function PermissionMatrix({
  selectedRole,
  allPermissions,
  checkedIds,
  grouped,
  resources,
  actions,
  isDirty,
  isSaving,
  onTogglePermission,
  onToggleResource,
  onSave,
  onUndo,
}: {
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
      <Card className="mb-0! overflow-hidden border border-kit">
        <div className="h-1.5 bg-kit-primary" />
        <CardBody className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-kit-primary text-lg font-bold text-kit-white">
            {selectedRole.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="mb-0.5 text-base font-bold text-kit-heading">{selectedRole.name}</h2>
            <p className="m-0 text-xs text-kit-muted">
              {selectedRole.desctiption || 'Không có mô tả'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <div className="rounded border border-kit bg-kit-page px-3.5 py-1.5 text-center">
              <div className="text-base font-bold leading-none text-kit-heading">
                {selectedRole.roleUsers?.length ?? 0}
              </div>
              <div className="mt-0.5 text-[10px] text-kit-muted">thành viên</div>
            </div>
            <div className="rounded border border-kit-primary/30 bg-kit-page px-3.5 py-1.5 text-center">
              <div className="text-base font-bold leading-none text-kit-primary">
                {checkedIds.size}
              </div>
              <div className="mt-0.5 text-[10px] text-kit-muted">quyền</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-0! overflow-hidden border border-kit">
        <CardHeader className="h-auto py-3">
          <div className="text-sm font-bold text-kit-heading">Ma trận quyền</div>
        </CardHeader>

        {allPermissions.length === 0 ? (
          <p className="p-6 text-center text-sm text-kit-muted">
            Chưa có quyền nào — hãy tạo quyền ở bảng bên dưới
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse">
              <thead>
                <tr className="bg-kit-page">
                  <th className="w-44 border-b border-kit px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-kit-muted">
                    Tài nguyên
                  </th>
                  <th className="min-w-[70px] border-b border-kit px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-kit-muted">
                    Tất cả
                  </th>
                  {actions.map((action: string) => (
                    <th
                      key={action}
                      className="min-w-[76px] border-b border-kit px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-kit-muted"
                    >
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((resource: string, rowIndex: number) => {
                  const resourcePermissions = grouped[resource] ?? [];
                  const allChecked =
                    resourcePermissions.length > 0 &&
                    resourcePermissions.every((permission: PermissionDTO) =>
                      checkedIds.has(permission.id),
                    );
                  const someChecked =
                    !allChecked &&
                    resourcePermissions.some((permission: PermissionDTO) =>
                      checkedIds.has(permission.id),
                    );

                  return (
                    <tr
                      key={resource}
                      className={rowIndex % 2 === 0 ? 'bg-kit-white' : 'bg-kit-page/40'}
                    >
                      <td className="border-b border-kit px-3.5 py-2.5 text-sm font-semibold text-kit-heading">
                        {resource}
                      </td>

                      <td className="border-b border-kit px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleResource(resource)}
                          title={allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          className={cn(
                            'inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] transition-all',
                            allChecked && 'border-0 bg-kit-success shadow-xs',
                            someChecked && 'border-0 bg-kit-warning shadow-xs',
                            !allChecked &&
                              !someChecked &&
                              'border-[1.5px] border-kit bg-kit-white',
                          )}
                        >
                          {allChecked ? <CheckIcon /> : null}
                          {someChecked ? <DashIcon /> : null}
                        </button>
                      </td>

                      {actions.map((action: string) => {
                        const permission = grouped[resource]?.find(
                          (item: PermissionDTO) => item.action.toLowerCase() === action,
                        );
                        if (!permission) {
                          return (
                            <td key={action} className="border-b border-kit px-2 py-2.5 text-center">
                              <span className="inline-block h-5 w-5 rounded-[5px] bg-kit-page" />
                            </td>
                          );
                        }

                        const checked = checkedIds.has(permission.id);
                        return (
                          <td key={action} className="border-b border-kit px-2 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => onTogglePermission(permission.id)}
                              title={permission.name}
                              className={cn(
                                'inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] transition-all',
                                checked
                                  ? 'border-0 bg-kit-success shadow-xs'
                                  : 'border-[1.5px] border-kit bg-kit-white',
                              )}
                            >
                              {checked ? <CheckIcon /> : null}
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
      </Card>

      <div className="flex justify-end gap-2">
        {isDirty ? (
          <Button
            variant="outline-secondary"
            size="sm"
            className="mb-0! mr-0!"
            onClick={onUndo}
          >
            Hoàn tác
          </Button>
        ) : null}
        <Button
          variant="primary"
          size="sm"
          className="mb-0! mr-0!"
          onClick={onSave}
          disabled={!isDirty}
          loading={isSaving}
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
