import { Plus } from 'lucide-react';
import type { PermissionDTO } from '@/features/auth/types/auth.types';
import { Badge } from '@/shared/elements/Badge';
import { Button } from '@/shared/elements/Button';
import { Card, CardHeader } from '@/shared/elements/Card';

export function PermissionListPanel({
  permissions,
  onAdd,
  onEdit,
  onDelete,
}: {
  permissions: PermissionDTO[];
  onAdd: () => void;
  onEdit: (permission: PermissionDTO) => void;
  onDelete: (permission: PermissionDTO) => void;
}) {
  return (
    <Card className="mb-0! overflow-hidden border border-kit">
      <CardHeader className="h-auto justify-between py-3">
        <div className="text-sm font-bold text-kit-heading">
          Danh sách quyền
          <span className="ml-2 text-xs font-medium text-kit-muted">
            {permissions.length} quyền
          </span>
        </div>
        <Button variant="primary" size="sm" className="mb-0! mr-0!" onClick={onAdd}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Tạo quyền
        </Button>
      </CardHeader>

      <div className="max-h-64 w-full overflow-x-auto overflow-y-auto">
        {permissions.length === 0 ? (
          <p className="p-6 text-center text-sm text-kit-muted">Chưa có quyền</p>
        ) : (
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="bg-kit-page">
                {['Tên quyền', 'Resource', 'Action', ''].map((header: string) => (
                  <th
                    key={header || 'actions'}
                    className="border-b border-kit px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-kit-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission: PermissionDTO, index: number) => (
                <tr
                  key={permission.id}
                  className={index % 2 === 0 ? 'bg-kit-white' : 'bg-kit-page/40'}
                >
                  <td className="border-b border-kit px-3 py-2 text-xs font-semibold text-kit-heading">
                    {permission.name}
                  </td>
                  <td className="border-b border-kit px-3 py-2">
                    <Badge variant="success" soft className="normal-case">
                      {permission.resource}
                    </Badge>
                  </td>
                  <td className="border-b border-kit px-3 py-2">
                    <Badge variant="secondary" soft className="normal-case">
                      {permission.action}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap border-b border-kit px-3 py-2 text-right">
                    <Button
                      variant="link"
                      size="sm"
                      className="mb-0! mr-2! px-0! py-0!"
                      onClick={() => onEdit(permission)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      borderless
                      className="mb-0! mr-0! px-0! py-0!"
                      onClick={() => onDelete(permission)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
