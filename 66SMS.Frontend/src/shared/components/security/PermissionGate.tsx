import { usePermission } from "@/shared/hooks/usePermission";

interface Props {
  resource: string;
  action: string;
  role?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate = ({
  resource,
  action,
  role,
  fallback = null,
  children,
}: Props) => {
  const { hasPermission, hasRole } = usePermission();

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return hasPermission(resource, action) ? <>{children}</> : <>{fallback}</>;
};
