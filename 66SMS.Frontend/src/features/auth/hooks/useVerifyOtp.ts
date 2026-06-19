import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { VerifyOtpRequest } from '@/features/auth/types/auth.types';
import type { Result } from '@/shared/types/common.types';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (body: VerifyOtpRequest) => authApi.verifyOtp(body),
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Xác minh OTP thất bại.')),
  });
