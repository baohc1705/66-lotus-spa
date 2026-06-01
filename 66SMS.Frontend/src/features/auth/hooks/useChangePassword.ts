import {useMutation} from '@tanstack/react-query';
import {authApi} from '@/features/auth/api/authApi';
import {toast} from 'sonner';

export const useChangePassword = () => {
    useMutation({
        mutationFn: authApi.changePassword,
        onSuccess:({data}) => data.isSuccess ? toast.success('Đổi mật khẩu thành công') : toast.error(data.message),
        onError: () => toast.error('Có lỗi xảy ra'),
    });
}