import type { AxiosError } from "axios";
import { toast } from "sonner";

export function getFileNameFromHeader(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  if (!contentDisposition) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^"]+)/i.exec(contentDisposition);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, "").trim());
  } catch {
    return match[1].replace(/"/g, "").trim();
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function handleExportError(error: AxiosError<Blob> | Error) {
  if (error instanceof Error && !(error as AxiosError).isAxiosError) {
    toast.error(error.message);
    return;
  }
  const axiosError = error as AxiosError<Blob>;
  const data = axiosError.response?.data;
  if (data instanceof Blob && data.type.includes("application/json")) {
    const text = await data.text();
    const json = JSON.parse(text) as { message?: string };
    toast.error(json.message ?? "Không thể xuất Excel");
    return;
  }
  toast.error("Không thể xuất Excel. Vui lòng thử lại.");
}
