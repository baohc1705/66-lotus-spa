import {useMutation} from '@tanstack/react-query';
import {authApi} from '@/features/auth/api/authApi';
import {toast} from 'sonner';

export const useForgotPassword = () => {
    useMutation({
        mutationFn: authApi.forgotPassword,
        onSuccess: ({data}) => data.isSuccess ? toast.success(data.message) : toast.error(data.message),
        onError: () => toast.error('Có lỗi xảy ra'),
    });
}