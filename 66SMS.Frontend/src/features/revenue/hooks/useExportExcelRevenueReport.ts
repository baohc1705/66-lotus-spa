import { useMutation } from "@tanstack/react-query";
import type { RevenueReportGrain } from "../types/revenue.types";
import { revenueApi } from "../api/revenue.api";
import {
  downloadBlob,
  getFileNameFromHeader,
  handleExportError,
} from "@/shared/utils/file.utils";
import { toast } from "sonner";

export function useExportReportByPeriod() {
  return useMutation({
    mutationFn: (params: {
      from: string;
      to: string;
      salonId?: number | null;
      grain: RevenueReportGrain;
    }) => revenueApi.exportReportByPeriod(params),
    onSuccess: (response, variables) => {
      const fallback = `BaoCao_TheoThoiGian_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất báo cáo doanh thu theo thời gian thành công");
    },
    onError: handleExportError,
  });
}

export function useExportReportBySalon() {
  return useMutation({
    mutationFn: (params: { from: string; to: string }) =>
      revenueApi.exportReportBySalon(params),
    onSuccess: (response, variables) => {
      const fallback = `BaoCao_TheoChiNhanh_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất Excel theo chi nhánh");
    },
    onError: handleExportError,
  });
}

export function useExportReportByStaff() {
  return useMutation({
    mutationFn: (params: {
      from: string;
      to: string;
      salonId?: number | null;
    }) => revenueApi.exportReportByStaff(params),
    onSuccess: (response, variables) => {
      const fallback = `BaoCao_TheoNhanVien_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất Excel theo nhân viên");
    },
    onError: handleExportError,
  });
}

export function useExportReportByService() {
  return useMutation({
    mutationFn: (params: {
      from: string;
      to: string;
      salonId?: number | null;
      categoryId?: number | null;
    }) => revenueApi.exportReportByService(params),
    onSuccess: (response, variables) => {
      const fallback = `BaoCao_TheoDichVu_${variables.from.replaceAll("-", "")}_${variables.to.replaceAll("-", "")}.xlsx`;
      const fileName = getFileNameFromHeader(
        response.headers["content-disposition"] as string | undefined,
        fallback,
      );
      downloadBlob(response.data as Blob, fileName);
      toast.success("Đã xuất Excel theo dịch vụ");
    },
    onError: handleExportError,
  });
}
