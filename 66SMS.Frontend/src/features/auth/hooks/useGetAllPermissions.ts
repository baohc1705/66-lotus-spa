import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';

export const useGetAllPermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: authApi.getAllPermissions,
  });
};
