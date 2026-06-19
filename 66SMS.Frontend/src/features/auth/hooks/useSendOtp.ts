import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { SendOtpRequest } from '@/features/auth/types/auth.types';
import type { Result } from '@/shared/types/common.types';

export const useSendOtp = () =>
  useMutation({
    mutationFn: (body: SendOtpRequest) => authApi.sendOtp(body),
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Không thể gửi OTP. Vui lòng thử lại.')),
  });
