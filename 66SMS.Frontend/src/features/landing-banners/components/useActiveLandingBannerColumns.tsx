import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tooltip } from "@/shared/components/Tooltip";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import {
  IndexCell,
  MutedCell,
  NameCell,
  TextCell,
} from "@/shared/tables/TableCells";

import { LANDING_BANNER_PERM } from "../constants/landing-banner.permissions";
import type { LandingBannerDto } from "../types/landing-banner.types";

export const LANDING_BANNER_COLUMN_LABELS = {
  imageUrl: "Ảnh",
  title: "Tiêu đề",
  brandLabel: "Nhãn thương hiệu",
  sortOrder: "Thứ tự",
  status: "Trạng thái",
} as const;

function statusBadge(status: number | null | undefined) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Đang hiện
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      Ẩn
    </Badge>
  );
}

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
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl;
          return (
            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border border-kit bg-kit-page">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.original.title ?? "Banner"}
                  className="h-9 w-14 object-cover"
                />
              ) : (
                <span className="text-xs text-kit-muted">—</span>
              )}
            </div>
          );
        },
        size: 90,
        enableResizing: false,
      },
      {
        accessorKey: "title",
        header: cols.title,
        cell: ({ row }) => <NameCell value={row.original.title} />,
        size: 180,
      },
      {
        accessorKey: "brandLabel",
        header: cols.brandLabel,
        cell: ({ row }) => <TextCell value={row.original.brandLabel} />,
        size: 200,
      },
      {
        accessorKey: "sortOrder",
        header: cols.sortOrder,
        cell: ({ row }) => <MutedCell value={row.original.sortOrder ?? 0} />,
        size: 80,
      },
      {
        accessorKey: "status",
        header: cols.status,
        cell: ({ row }) => statusBadge(row.original.status),
        size: 110,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const banner = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PermissionGate resource={perm.resource} action={perm.update}>
                <Tooltip text="Sửa">
                  <Button
                    size="icon-sm"
                    variant="outline-primary"
                    className="mb-0 mr-0"
                    onClick={() => onEdit(banner)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
              <PermissionGate resource={perm.resource} action={perm.delete}>
                <Tooltip text="Xóa">
                  <Button
                    size="icon-sm"
                    variant="outline-danger"
                    className="mb-0 mr-0"
                    onClick={() => onDelete(banner)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </PermissionGate>
            </div>
          );
        },
        size: 100,
        enableResizing: false,
      },
    ],
    [pageIndex, pageSize, onEdit, onDelete, cols, perm],
  );
}
