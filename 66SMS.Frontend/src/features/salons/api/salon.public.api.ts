import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { PagedResult, Result } from "@/shared/types/common.types";
import type { SalonListItem } from "../types/salon.types";

const BASE = API.salons;

export const salonPublicApi = {
  getActive: () =>
    axiosInstance
      .get<Result<PagedResult<SalonListItem>>>(BASE, { params: { pageSize: 100, orderBy: "sortorder" } })
      .then((r) => r.data.data?.items || []),

  getPrimary: () =>
    axiosInstance
      .get<Result<SalonListItem | null>>(`${BASE}/primary`)
      .then((r) => r.data.data ?? null),
};
