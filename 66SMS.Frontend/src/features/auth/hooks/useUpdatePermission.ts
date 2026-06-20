import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/shared/utils/errorUtils';
import { toast } from 'sonner';
import type { Result } from '@/shared/types/common.types';

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; name: string; resource: string; action: string; description?: string }) =>
      authApi.updatePermission(id, body),
    onSuccess: (result) => {
      if (!result.isSuccess) { toast.error(result.message); return; }
      toast.success('Cập nhật quyền thành công');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, 'Cập nhật quyền thất bại')),
  });
};
