import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usersApi } from '@/features/users/api/usersApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async ({ data }) => {
      if (!data.isSuccess || !data.data) {
        toast.error(data.message);
        return;
      }
      setAccessToken(data.data.accessToken);

      const meRes = await usersApi.getMe();
      if (meRes.data.isSuccess && meRes.data.data) {
        const userData = meRes.data.data;
        setUser(userData);
        
        // Điều hướng dựa trên role
        const roles = userData.roles ?? [];
        const isAdmin = roles.some(r => r.toLowerCase() === 'admin');
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    },
    onError: () => toast.error('Đăng nhập thất bại'),
  });
};