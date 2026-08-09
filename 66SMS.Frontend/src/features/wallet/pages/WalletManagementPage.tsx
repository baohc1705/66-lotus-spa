import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Eye, Wallet } from "lucide-react";

import { Tooltip } from "@/shared/components/Tooltip";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { IndexCell, MutedSmallCell, NameCell, PriceCell, TextCell } from "@/shared/tables/TableCells";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { DEFAULT_LOADING_ROWS } from "@/shared/constants/display.const";
import {
  formatDateTimeDisplay,
  formatDisplayDate,
} from "@/shared/utils/date.utils";

import { WalletTransactionModal } from "../components/WalletTransactionModal";
import { getAdminWallets } from "../api/wallet.api";
import type { AdminWalletDto } from "../types/wallet.types";

function walletStatusBadge(status: number) {
  let label = "Không rõ";
  let variant: BadgeVariant = "secondary";
  if (status === 1) {
    label = "Hoạt động";
    variant = "success";
  } else if (status === 2) {
    label = "Đang khóa";
    variant = "danger";
  } else if (status === 3) {
    label = "Đã đóng";
    variant = "dark";
  }
  return <Badge variant={variant}>{label}</Badge>;
}

export function WalletManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-wallets"],
    queryFn: getAdminWallets,
  });

  const wallets = useMemo(() => response?.data || [], [response]);

  const filteredWallets = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return wallets.filter((wallet: AdminWalletDto) => {
      const nameMatch = (wallet.customerName || "")
        .toLowerCase()
        .includes(keyword);
      const phoneMatch = (wallet.customerPhone || "").includes(searchTerm);
      return nameMatch || phoneMatch;
    });
  }, [wallets, searchTerm]);

  const columns = useMemo<ColumnDef<AdminWalletDto>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <IndexCell pageIndex={1} pageSize={filteredWallets.length} rowIndex={row.index} />
        ),
        size: 50,
      },
      {
        accessorKey: "id",
        header: "Mã ví",
        cell: ({ row }) => <MutedSmallCell value={`#${row.original.id}`} />,
        size: 70,
      },
      {
        accessorKey: "customerId",
        header: "Mã khách",
        cell: ({ row }) => (
          <MutedSmallCell value={`#${row.original.customerId}`} />
        ),
        size: 70,
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng",
        cell: ({ row }) => <NameCell value={row.original.customerName} />,
      },
      {
        accessorKey: "customerPhone",
        header: "Số điện thoại",
        cell: ({ row }) => <TextCell value={row.original.customerPhone} />,
      },
      {
        accessorKey: "balance",
        header: "Số dư ví",
        cell: ({ row }) => <PriceCell value={row.original.balance} />,
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => walletStatusBadge(row.original.status),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo ví",
        cell: ({ row }) => (
          <MutedSmallCell value={formatDisplayDate(row.original.createdAt)} />
        ),
      },
      {
        id: "updatedAt",
        header: "Cập nhật lần cuối",
        cell: ({ row }) => (
          <MutedSmallCell
            value={formatDateTimeDisplay(
              row.original.updatedAt || row.original.createdAt,
            )}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <Tooltip text="Chi tiết">
              <Button
                type="button"
                size="icon-sm"
                variant="outline-info"
                className="mb-0 mr-0"
                onClick={() =>
                  setSelectedWallet({
                    id: row.original.id,
                    name: row.original.customerName,
                  })
                }
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        ),
        size: 60,
      },
    ],
    [filteredWallets.length],
  );

  const table = useReactTable({
    data: filteredWallets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3 pb-6 font-sans text-sm text-kit-body">
      <TablePageShell isLoading={isLoading}>
        <div className="border-b border-kit px-4 pt-4">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên hoặc số điện thoại..."
          />
        </div>

        <DataTable
          table={table}
          isLoading={isLoading}
          loadingRows={DEFAULT_LOADING_ROWS}
          emptyState={
            <TableEmptyState
              icon={Wallet}
              title="Không tìm thấy dữ liệu ví"
            />
          }
        />
      </TablePageShell>

      <WalletTransactionModal
        walletId={selectedWallet?.id || null}
        customerName={selectedWallet?.name || ""}
        isOpen={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </div>
  );
}
