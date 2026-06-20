import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { Result } from '@/shared/types/common.types';

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; name: string; description?: string }) =>
      authApi.updateRole(id, body),
    onSuccess: (result) => {
      if (!result.isSuccess) { toast.error(result.message); return; }
      toast.success('Cập nhật vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Cập nhật vai trò thất bại')),
  });
};
