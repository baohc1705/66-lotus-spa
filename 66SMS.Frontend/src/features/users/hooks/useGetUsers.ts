import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import { userKeys } from "./useGetMe";
import type { PageRequest } from "@/shared/types/common.types";

export const useGetUsers = (params?: PageRequest) => {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn: async () => {
      const result = await usersApi.getAll(params);
      return result.data;
    },
    staleTime: 1000 * 30,
  });
};
