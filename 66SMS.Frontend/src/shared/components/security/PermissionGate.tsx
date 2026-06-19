// Bọc component con — chỉ render nếu user có đủ quyền.
// Admin role tự động có quyền mọi thứ, không cần kiểm tra.
//
// Cách dùng:
//   <PermissionGate resource="staffs" action="update">
//     <EditButton />
//   </PermissionGate>
import { usePermission } from "@/shared/hooks/usePermission";

interface Props {
  resource: string; // tên tài nguyên (user, product...)
  action: string; // hành động (create, update...)
  role?: string; // vai trò bắt buộc (VD: admin)
  fallback?: React.ReactNode; // UI thay thế nếu không có quyền
  children: React.ReactNode; // nội dung cần bảo vệ
}

export const PermissionGate = ({
  resource,
  action,
  role,
  fallback = null,
  children,
}: Props) => {
  // Lấy hàm kiểm tra quyền và role
  const { hasPermission, hasRole } = usePermission();

  // Kiểm tra role bắt buộc (nếu có)
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Có quyền -> render children
  // Không có quyền -> render fallback
  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};
