import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import { useAuthStore } from "@/features/auth/stores/authStore";

export const userKeys = {
  // Key gốc cho toàn bộ dữ liệu liên quan tới users
  // => ['users']
  all: ["users"] as const,

  // Key cho thông tin user hiện tại (user đang login)
  // => ['users', 'me']
  me: () => [...userKeys.all, "me"] as const,

  // Key gốc cho danh sách users
  // => ['users', 'list']
  lists: () => [...userKeys.all, "list"] as const,

  // Key cho danh sách users có tham số
  // params dùng để phân biệt cache
  //
  // Ví dụ:
  // userKeys.list({page:1, limit:10})
  // => ['users', 'list', {page:1, limit:10}]
  //
  // userKeys.list({page:2, limit:10})
  // => ['users', 'list', {page:2, limit:10}]
  //
  // React Query sẽ hiểu đây là 2 cache khác nhau
  list: (params: object) => [...userKeys.lists(), params] as const,

  // Key cho chi tiết 1 user theo id
  //
  // Ví dụ:
  // userKeys.detail(5)
  // => ['users', 5]
  detail: (id: number) => [...userKeys.all, id] as const,
};

export const useGetMe = () => {
  const accessToken = useAuthStore((x) => x.accessToken);
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const result = await usersApi.getMe();
      return result.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 phut
  });
};
