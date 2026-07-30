import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { revenueApi } from "../api/revenue.api";
import {
  downloadBlob,
  getFileNameFromHeader,
  handleExportError,
} from "@/shared/utils/file.utils";

export function useExportRevenueBySalon() {
  const exportMutation = useMutation({
    mutationFn: (params: { from: string; to: string }) =>
      revenueApi.exportBySalon(params),
    onSuccess: (response, variables) => {
      const fallback = `DoanhThu_ChiNhanh_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất file Excel so sánh chi nhánh");
    },
    onError: handleExportError,
  });

  return exportMutation;
}
