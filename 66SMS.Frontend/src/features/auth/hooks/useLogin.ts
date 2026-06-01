import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usersApi } from '@/features/users/api/usersApi';
import { toast } from 'sonner';

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async ({ data }) => {
      if (!data.isSuccess || !data.data) {
        toast.error(data.message);
        return;
      }
      setAccessToken(data.data.accessToken);

      // Lấy thông tin user (roles, permissions) sau khi login
      const meRes = await usersApi.getMe();
      if (meRes.data.isSuccess && meRes.data.data) {
        setUser(meRes.data.data);
      }
    },
    onError: () => toast.error('Đăng nhập thất bại'),
  });
};