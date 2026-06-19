import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { CreateCustomerPayload } from '@/features/customers/types/customer.types';
import type { Result } from '@/shared/types/common.types';

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: CreateCustomerPayload) => authApi.register(payload),
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.')),
  });
