import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Result } from '@/shared/types/common.types';

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      if (!result.isSuccess || !result.data) {
        toast.error(result.message);
        return;
      }

      setSession(result.data);

      const roles = result.data.userProfile.roles ?? [];
      const isCustomer = roles.some((r: string) => r.toLowerCase() === 'customer');
      navigate(isCustomer ? '/' : '/admin');
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Đăng nhập thất bại')),
  });
};
