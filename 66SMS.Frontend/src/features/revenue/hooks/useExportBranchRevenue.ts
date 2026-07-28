import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { revenueApi } from "../api/revenue.api";

function getFileNameFromHeader(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(contentDisposition);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, "").trim());
  } catch {
    return match[1].replace(/"/g, "").trim();
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useExportBranchRevenue() {
  const exportMutation = useMutation({
    mutationFn: (params: { from: string; to: string; salonId: number }) =>
      revenueApi.exportBranch(params),
    onSuccess: (response, variables) => {
      const fallback = `DoanhThu_CN_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất báo cáo doanh thu chi nhánh");
    },
    onError: async (error: AxiosError<Blob> | Error) => {
      if (error instanceof Error && !(error as AxiosError).isAxiosError) {
        toast.error(error.message);
        return;
      }

      const axiosError = error as AxiosError<Blob>;
      const data = axiosError.response?.data;
      if (data instanceof Blob && data.type.includes("application/json")) {
        try {
          const text = await data.text();
          const json = JSON.parse(text) as { message?: string };
          toast.error(json.message ?? "Không thể xuất Excel");
          return;
        } catch {
          // fall through
        }
      }
      toast.error("Không thể xuất Excel. Vui lòng thử lại.");
    },
  });

  return exportMutation;
}
