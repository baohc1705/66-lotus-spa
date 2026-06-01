import { usePermission } from "@/shared/hooks/usePermission";

interface Props {
  resource: string; // tên tài nguyên (user, product...)
  action: string; // hành động (create, update...)
  fallback?: React.ReactNode; // UI thay thế nếu không có quyền
  children: React.ReactNode; // nội dung cần bảo vệ
}

export const PermissionGate = ({
  resource,
  action,
  fallback = null,
  children,
}: Props) => {
  // Lấy hàm kiểm tra quyền
  const { hasPermission } = usePermission();
  console.log(resource, action, hasPermission(resource, action));

  // Có quyền -> render children
  // Không có quyền -> render fallback
  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};
