import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usersApi } from '@/features/users/api/usersApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Result } from '@/shared/types/common.types';

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (result) => {
      if (!result.isSuccess || !result.data) {
        toast.error(result.message);
        return;
      }
      setAccessToken(result.data.accessToken);

      const meRes = await usersApi.getMe();
      if (meRes.isSuccess && meRes.data) {
        const userData = meRes.data;
        setUser(userData);

        const roles = userData.roles ?? [];
        const isAdmin = roles.some(r => r.toLowerCase() === 'admin');
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error, 'Đăng nhập thất bại')),
  });
};