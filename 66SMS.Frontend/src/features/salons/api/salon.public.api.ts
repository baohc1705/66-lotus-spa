import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { PagedResult, Result } from "@/shared/types/common.types";
import type { SalonDTO } from "../types/salon.types";

const BASE = API.salons;

export const salonPublicApi = {
  getActive: () =>
    axiosInstance
      .get<Result<PagedResult<SalonDTO>>>(BASE, { params: { pageSize: 100 } })
      .then((r) => r.data.data?.items || []),
};
