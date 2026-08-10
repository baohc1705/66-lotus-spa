import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";
import type { SalonListItem } from "../types/salon.types";


export const salonPublicApi = {
  getActive: () =>
    axiosInstance
      .get<
        Result<PagedResult<SalonListItem>>
      >("/salons", { params: { pageSize: 100, orderBy: "sortorder" } })
      .then((r) => r.data.data?.items || []),

  getPrimary: () =>
    axiosInstance
      .get<Result<SalonListItem | null>>(`/salons/primary`)
      .then((r) => r.data.data ?? null),
};
