import { useState, useCallback, useMemo } from "react";
import { motion, type Variants } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { DataTable } from "@/shared/components/DataTable/DataTable";
import { DataTableViewOptions } from "@/shared/components/DataTable/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { DataTablePagination } from "@/shared/components/DataTable/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/DataTable/DataTableToolbar";
import { MembershipCardFormDialog } from "../components/MembershipCardFormDialog";
import { MembershipCardDetailExpanded } from "../components/MembershipCardDetailExpanded";
import { useMembershipCards } from "../hooks/useMembershipCards";
import type { MembershipCardDto } from "../types/membershipCard.types";

const CARD_STATUS_MAP: StatusMap = {
  "0": { label: "Ngưng hoạt động", variant: "error" },
  "1": { label: "Hoạt động", variant: "success", dot: true },
  "2": { label: "Tạm khóa", variant: "warning" },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export function MembershipCardListPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [editCard, setEditCard] = useState<MembershipCardDto | null>(null);

  const {
    data: cardsResult,
    isLoading,
    isFetching,
  } = useMembershipCards({
    pageIndex,
    pageSize,
    keyword: filter || undefined,
    orderBy,
    isDescending,
  });

  const paged = cardsResult?.data;
  const cards = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;

  const handleSort = useCallback(
    (column: string) => {
      if (orderBy === column) {
        setIsDescending((prev) => !prev);
      } else {
        setOrderBy(column);
        setIsDescending(false);
      }
    },
    [orderBy],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilter(value);
    setPageIndex(1);
  }, []);

  const SortIcon = useCallback(
    ({ column }: { column: string }) => {
      if (orderBy !== column)
        return <ArrowUpDown className="w-3 h-3 opacity-40" />;
      return isDescending ? (
        <ArrowDown className="w-3 h-3 text-lotus-leaf" />
      ) : (
        <ArrowUp className="w-3 h-3 text-lotus-leaf" />
      );
    },
    [orderBy, isDescending],
  );

  const columns = useMemo<ColumnDef<MembershipCardDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-lotus-stone">
            {(pageIndex - 1) * pageSize + row.index + 1}
          </span>
        ),
        size: 50,
        enableResizing: false,
      },
      {
        accessorKey: "cardCode",
        header: () => (
          <button
            onClick={() => handleSort("cardCode")}
            className="flex items-center gap-1.5 hover:text-lotus-leaf transition-colors"
          >
            Mã thẻ <SortIcon column="cardCode" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-500" />
            <span className="font-bold text-lotus-deep">
              {row.original.cardCode}
            </span>
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => (
          <span className="font-semibold text-lotus-deep/80">
            {row.original.customerName ?? "—"}
          </span>
        ),
        size: 180,
      },
      {
        accessorKey: "tierName",
        header: "Loại thẻ",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80 font-medium">
            {row.original.tierName ?? "—"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "issuedAt",
        header: "Ngày cấp",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80 text-[13px]">
            {row.original.issuedAt
              ? new Date(row.original.issuedAt).toLocaleDateString("vi-VN")
              : "—"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "expiresAt",
        header: "Hết hạn",
        cell: ({ row }) => (
          <span className="text-lotus-deep/80 text-[13px]">
            {row.original.expiresAt
              ? new Date(row.original.expiresAt).toLocaleDateString("vi-VN")
              : "Vĩnh viễn"}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={String(row.original.status)}
            statusMap={CARD_STATUS_MAP}
          />
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const card = row.original;
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
                  <DropdownMenuItem onClick={() => row.toggleExpanded()}>
                    <Eye className="w-4 h-4 mr-2" />
                    {row.getIsExpanded() ? "Đóng chi tiết" : "Xem chi tiết"}
                  </DropdownMenuItem>
                  <PermissionGate resource="customers" action="update">
                    <DropdownMenuItem onClick={() => setEditCard(card)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Chỉnh sửa
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
    [pageIndex, pageSize, handleSort, SortIcon],
  );

  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableMultiRowSelection: false,
    columnResizeMode: "onChange",
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden"
      >
        <div className="px-4 pt-4">
          <DataTableToolbar
            searchValue={filter}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Tìm mã thẻ, tên khách hàng..."
          >
            <DataTableViewOptions
              table={table}
              columnLabels={{
                cardCode: "Mã thẻ",
                customerName: "Khách hàng",
                tierName: "Loại thẻ",
                issuedAt: "Ngày cấp",
                expiresAt: "Ngày hết hạn",
                status: "Trạng thái",
              }}
            />
            {/* Không có nút Thêm vì thẻ tự động tạo khi tạo khách hàng */}
          </DataTableToolbar>
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={pageSize > 5 ? 5 : pageSize}
          onRowClick={(row) => row.toggleExpanded()}
          renderSubComponent={({ row }) =>
            row.original.id ? (
              <MembershipCardDetailExpanded
                cardId={row.original.id}
                onEdit={(card) => setEditCard(card)}
              />
            ) : null
          }
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-lotus-cream flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lotus-deep">
                  Chưa có thẻ thành viên
                </p>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Thẻ sẽ tự động được tạo khi khách hàng mới được đăng ký.
                </p>
              </div>
            </div>
          }
          pagination={
            paged && totalCount > 0 ? (
              <DataTablePagination
                pageIndex={paged.pageIndex}
                pageSize={paged.pageSize}
                totalCount={paged.totalCount}
                totalPages={paged.totalPages}
                hasPreviousPage={paged.hasPreviousPage}
                hasNextPage={paged.hasNextPage}
                onPageChange={setPageIndex}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null
          }
        />

        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-lotus-leaf/30 overflow-hidden">
            <div className="h-full w-1/3 bg-lotus-leaf animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}
      </motion.div>

      {/* Edit Dialog Only */}
      <MembershipCardFormDialog
        open={!!editCard}
        onOpenChange={(open) => {
          if (!open) setEditCard(null);
        }}
        card={editCard}
      />
    </motion.div>
  );
}
