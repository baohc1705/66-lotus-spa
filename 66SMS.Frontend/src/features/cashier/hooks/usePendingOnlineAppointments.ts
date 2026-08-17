import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { cashierOnlineApi } from "../api/cashierOnline.api";
import {
  CASHIER_PENDING_ONLINE,
  CASHIER_PENDING_ONLINE_COUNT,
} from "../cashierQueryKey";

export async function invalidatePendingOnlineQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: [CASHIER_PENDING_ONLINE],
  });
  await queryClient.invalidateQueries({
    queryKey: [CASHIER_PENDING_ONLINE_COUNT],
  });
}

export function useInvalidatePendingOnline() {
  const queryClient = useQueryClient();

  async function invalidatePendingOnline() {
    await invalidatePendingOnlineQueries(queryClient);
  }

  return { invalidatePendingOnline };
}

export function usePendingOnlineAppointments(
  pageIndex: number,
  pageSize: number,
  enabled: boolean,
  salonId?: number | null,
) {
  return useQuery({
    queryKey: [CASHIER_PENDING_ONLINE, salonId ?? null, pageIndex, pageSize],
    queryFn: () => cashierOnlineApi.getPendingList({ pageIndex, pageSize }),
    enabled,
    staleTime: 0,
  });
}

export function usePendingOnlineCount(
  enabled: boolean,
  salonId?: number | null,
) {
  return useQuery({
    queryKey: [CASHIER_PENDING_ONLINE_COUNT, salonId ?? null],
    queryFn: () =>
      cashierOnlineApi.getPendingList({ pageIndex: 1, pageSize: 1 }),
    select: (data) => data.totalCount ?? 0,
    enabled,
    staleTime: 0,
    refetchInterval: 30_000,
  });
}
