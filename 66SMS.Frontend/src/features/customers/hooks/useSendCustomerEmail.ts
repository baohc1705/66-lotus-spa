import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/utils/kitToast";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { sendCustomerEmail } from "../api/customerEmail.api";
import type { SendEmailPayload } from "../types/customer.types";

export function useSendCustomerEmail() {
  return useMutation({
    mutationFn: (payload: SendEmailPayload) => sendCustomerEmail(payload),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        toast.error(result.message || "Gửi email thất bại, vui lòng thử lại.");
        return;
      }
      toast.success(result.message || "Đã gửi email cho khách hàng.");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error as AxiosError<Result<unknown>>,
          "Gửi email thất bại, vui lòng thử lại.",
        ),
      );
    },
  });
}
