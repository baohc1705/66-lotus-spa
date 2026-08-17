import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import type { AppointmentDto } from "@/features/booking/types/booking.types";
import axiosInstance from "@/shared/api/axiosInstance";
import { type PagedResult, type Result } from "@/shared/types/common.types";

export type GetOnlineAppointmentParams = {
  pageIndex?: number;
  pageSize?: number;
};

const EMPTY_PAGED: PagedResult<AppointmentDto> = {
  items: [],
  pageIndex: 0,
  pageSize: 0,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const cashierOnlineApi = {
  getPendingList: async (
    params: GetOnlineAppointmentParams = {},
  ): Promise<PagedResult<AppointmentDto>> => {
    const pageIndex = params.pageIndex ?? 1;
    const pageSize = params.pageSize ?? 20;
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      "/appointment",
      {
        params: {
          Status: APPOINTMENT_STATUS.PENDING,
          pageIndex,
          pageSize,
        },
      },
    );
    return res.data.data ?? { ...EMPTY_PAGED, pageIndex, pageSize };
  },
};
