import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { Result } from '@/shared/types/common.types';

export const useForgotPassword = () =>
  useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (result) => result.isSuccess ? toast.success(result.message) : toast.error(result.message),
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  })