import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import type { SendEmailPayload } from "../types/customer.types";

export async function sendCustomerEmail(
  payload: SendEmailPayload,
): Promise<Result<null>> {
  const { data } = await axiosInstance.post<Result<null>>(
    "/emails/send",
    payload,
  );
  return data;
}
