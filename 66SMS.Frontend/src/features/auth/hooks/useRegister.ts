import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { RegisterPayload, RegisterResponseDto } from '@/features/auth/types/auth.types';
import type { Result } from '@/shared/types/common.types';

export const useRegister = () =>
  useMutation<Result<RegisterResponseDto>, AxiosError<Result<unknown>>, RegisterPayload>({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onError: (error) =>
      toast.error(getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.')),
  });
