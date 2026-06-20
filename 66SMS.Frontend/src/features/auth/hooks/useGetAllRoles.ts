import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';

export const useGetAllRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => authApi.getAllRoles(),
  });
};
