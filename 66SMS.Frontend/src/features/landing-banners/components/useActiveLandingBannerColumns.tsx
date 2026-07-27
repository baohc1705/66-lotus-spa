import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { IndexCell } from "@/shared/components/DataTable/TableCells";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { LANDING_BANNER_PERM } from "../constants/landing-banner.permissions";
import type { LandingBannerDto } from "../types/landing-banner.types";

export const LANDING_BANNER_COLUMN_LABELS = {
  imageUrl: "Ảnh",
  title: "Tiêu đề",
  brandLabel: "Nhãn thương hiệu",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;

interface UseActiveLandingBannerColumnsParams {
  pageIndex: number;
  pageSize: number;
  onEdit: (item: LandingBannerDto) => void;
  onDelete: (item: LandingBannerDto) => void;
}

export function useActiveLandingBannerColumns({
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
}: UseActiveLandingBannerColumnsParams) {
  const cols = LANDING_BANNER_COLUMN_LABELS;
  const perm = LANDING_BANNER_PERM;

  return useMemo<ColumnDef<LandingBannerDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell
            pageIndex={pageIndex}
            pageSize={pageSize}
            rowIndex={row.index}
          />
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "imageUrl",
        header: cols.imageUrl,
        cell: ({ row }) =>
          row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt={row.original.title ?? "Banner"}
              className="h-10 w-16 object-cover rounded"
            />
          ) : (
            <span className="text-adminInk/40 text-xs">—</span>
          ),
        size: 90,
      },
      {
        accessorKey: "title",
        header: cols.title,
        cell: ({ row }) => (
          <span className="font-bold text-adminInk">{row.original.title}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "brandLabel",
        header: cols.brandLabel,
        cell: ({ row }) => (
          <span className="text-adminInk/80 text-sm">
            {row.original.brandLabel || "—"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "sortOrder",
        header: cols.sortOrder,
        cell: ({ row }) => (
          <span className="text-adminInk/80">{row.original.sortOrder ?? 0}</span>
        ),
        size: 80,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) =>
          row.original.status === 1 ? (
            <span className="text-xs font-medium text-adminGreen-700 bg-adminGreen-50 px-1.5 py-0.5 rounded">
              Đang hiện
            </span>
          ) : (
            <span className="text-xs font-medium text-adminGray-600 bg-adminGray-100 px-1.5 py-0.5 rounded">
              Ẩn
            </span>
          ),
        size: 100,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const banner = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PermissionGate resource={perm.resource} action={perm.update}>
                    <DropdownMenuItem onClick={() => onEdit(banner)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {COMMON_MSG.edit}
                    </DropdownMenuItem>
                  </PermissionGate>
                  <PermissionGate resource={perm.resource} action={perm.delete}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(banner)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa banner
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onEdit, onDelete, cols, perm]
  );
}
