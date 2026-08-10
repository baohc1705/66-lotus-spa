import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type RowSelectionState,
  type ExpandedState,
} from "@tanstack/react-table";
import { Eye, Pencil, User } from "lucide-react";
import { DataTable } from "@/shared/tables/DataTable";
import { DataTableToolbar } from "@/shared/tables/DataTableToolbar";
import { DataTableViewOptions } from "@/shared/tables/DataTableViewOptions";
import { SortableColumnHeader } from "@/shared/tables/SortableColumnHeader";
import { TablePageShell } from "@/shared/tables/TablePageShell";
import { TableSelectionBar } from "@/shared/tables/TableSelectionBar";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { Pagination } from "@/shared/components/Pagination";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

type FakeRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  status: "Active" | "Inactive";
  joinedAt: string;
  note: string;
};

const fakeRows: FakeRow[] = [
  {
    id: 1,
    name: "Nguyen Lan",
    email: "lan@mail.com",
    phone: "0901 111 111",
    branch: "District 1",
    role: "Receptionist",
    status: "Active",
    joinedAt: "2024-01-12",
    note: "Ca sang, uu tien booking online.",
  },
  {
    id: 2,
    name: "Tran Minh",
    email: "minh@mail.com",
    phone: "0902 222 222",
    branch: "District 3",
    role: "Technician",
    status: "Active",
    joinedAt: "2023-08-03",
    note: "Chuyen massage body, rating cao.",
  },
  {
    id: 3,
    name: "Le Hoa",
    email: "hoa@mail.com",
    phone: "0903 333 333",
    branch: "Binh Thanh",
    role: "Cashier",
    status: "Inactive",
    joinedAt: "2022-11-20",
    note: "Tam nghi viec tu T3/2026.",
  },
  {
    id: 4,
    name: "Pham An",
    email: "an@mail.com",
    phone: "0904 444 444",
    branch: "District 1",
    role: "Manager",
    status: "Active",
    joinedAt: "2021-05-09",
    note: "Quan ly chi nhanh Q1.",
  },
  {
    id: 5,
    name: "Hoang My",
    email: "my@mail.com",
    phone: "0905 555 555",
    branch: "Thu Duc",
    role: "Technician",
    status: "Active",
    joinedAt: "2024-06-18",
    note: "Chuyen facial / skincare.",
  },
  {
    id: 6,
    name: "Vu Khoa",
    email: "khoa@mail.com",
    phone: "0906 666 666",
    branch: "District 3",
    role: "Technician",
    status: "Inactive",
    joinedAt: "2023-02-14",
    note: "Dang dao tao lai quy trinh moi.",
  },
  {
    id: 7,
    name: "Do Trang",
    email: "trang@mail.com",
    phone: "0907 777 777",
    branch: "District 1",
    role: "Receptionist",
    status: "Active",
    joinedAt: "2025-01-08",
    note: "Ca toi, tieng Anh tot.",
  },
  {
    id: 8,
    name: "Bui Long",
    email: "long@mail.com",
    phone: "0908 888 888",
    branch: "Binh Thanh",
    role: "Technician",
    status: "Active",
    joinedAt: "2024-09-22",
    note: "Ho tro su kien spa cuoi tuan.",
  },
  {
    id: 9,
    name: "Ngo Yen",
    email: "yen@mail.com",
    phone: "0909 999 999",
    branch: "Thu Duc",
    role: "Cashier",
    status: "Active",
    joinedAt: "2023-12-01",
    note: "Quen VNPay / tien mat.",
  },
  {
    id: 10,
    name: "Dang Phuc",
    email: "phuc@mail.com",
    phone: "0910 101 010",
    branch: "District 3",
    role: "Manager",
    status: "Active",
    joinedAt: "2020-07-15",
    note: "Quan ly chi nhanh Q3.",
  },
  {
    id: 11,
    name: "Ly Quynh",
    email: "quynh@mail.com",
    phone: "0911 111 222",
    branch: "Binh Thanh",
    role: "Receptionist",
    status: "Inactive",
    joinedAt: "2022-04-27",
    note: "Nghi thai san.",
  },
  {
    id: 12,
    name: "Cao Nam",
    email: "nam@mail.com",
    phone: "0912 222 333",
    branch: "District 1",
    role: "Technician",
    status: "Active",
    joinedAt: "2025-03-02",
    note: "Moi onboard, can mentor.",
  },
];

const columnLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  branch: "Branch",
  role: "Role",
  status: "Status",
};

const columnHelper = createColumnHelper<FakeRow>();

function DemoDetailExpanded({
  row,
  onEdit,
}: {
  row: FakeRow;
  onEdit: () => void;
}) {
  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={<User className="h-8 w-8 text-kit-muted" />}
        title={row.name}
        subtitle={row.role + " · " + row.branch}
      />
      <TableDetailGrid>
        <div>
          <TableDetailField label="Email" value={row.email} />
          <TableDetailField label="Phone" value={row.phone} />
          <TableDetailField label="Joined" value={row.joinedAt} />
        </div>
        <div>
          <TableDetailField
            label="Status"
            value={
              row.status === "Active" ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )
            }
          />
          <TableDetailField label="Note" value={row.note} />
        </div>
      </TableDetailGrid>
      <TableDetailActions>
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </TableDetailActions>
    </TableDetailExpanded>
  );
}

export function DataTablePage() {
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [orderBy, setOrderBy] = useState<string>("name");
  const [isDescending, setIsDescending] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  function onSort(column: string) {
    if (orderBy === column) {
      setIsDescending(!isDescending);
    } else {
      setOrderBy(column);
      setIsDescending(false);
    }
    setPageIndex(1);
  }

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return fakeRows;
    return fakeRows.filter(
      (row: FakeRow) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.branch.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q),
    );
  }, [searchValue]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    const key = orderBy as keyof FakeRow;
    rows.sort((a: FakeRow, b: FakeRow) => {
      const av = String(a[key] ?? "");
      const bv = String(b[key] ?? "");
      const cmp = av.localeCompare(bv, "vi", { sensitivity: "base" });
      return isDescending ? -cmp : cmp;
    });
    return rows;
  }, [filtered, orderBy, isDescending]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(pageIndex, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageIds = pageRows.map((r: FakeRow) => String(r.id));
  const selectedCount = Object.keys(rowSelection).filter(
    (id: string) => rowSelection[id],
  ).length;
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id: string) => rowSelection[id]);
  const somePageSelected = pageIds.some((id: string) => rowSelection[id]);
  const headerIndeterminate = somePageSelected && !allPageSelected;

  const columns = [
    columnHelper.display({
      id: "select",
      size: 40,
      enableHiding: false,
      header: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            className="mb-0"
            checked={allPageSelected}
            indeterminate={headerIndeterminate}
            onChange={() => {
              // Co chon (full / dau -) → bo het; chua chon → chon tat ca trang
              const shouldClear = allPageSelected || headerIndeterminate;
              setRowSelection((prev) => {
                const next = { ...prev };
                pageIds.forEach((id: string) => {
                  if (shouldClear) delete next[id];
                  else next[id] = true;
                });
                return next;
              });
            }}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            className="mb-0"
            checked={!!rowSelection[String(row.original.id)]}
            onChange={(checked: boolean) => {
              const id = String(row.original.id);
              setRowSelection((prev) => {
                const next = { ...prev };
                if (checked) next[id] = true;
                else delete next[id];
                return next;
              });
            }}
          />
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      size: 160,
      header: () => (
        <SortableColumnHeader
          label="Name"
          column="name"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
      cell: (info) => (
        <span className="font-medium text-kit-heading">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("email", {
      size: 200,
      header: () => (
        <SortableColumnHeader
          label="Email"
          column="email"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
    }),
    columnHelper.accessor("phone", {
      size: 140,
      header: () => (
        <SortableColumnHeader
          label="Phone"
          column="phone"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
    }),
    columnHelper.accessor("branch", {
      size: 140,
      header: () => (
        <SortableColumnHeader
          label="Branch"
          column="branch"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
    }),
    columnHelper.accessor("role", {
      size: 130,
      header: () => (
        <SortableColumnHeader
          label="Role"
          column="role"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
    }),
    columnHelper.accessor("status", {
      size: 110,
      header: () => (
        <SortableColumnHeader
          label="Status"
          column="status"
          orderBy={orderBy}
          isDescending={isDescending}
          onSort={onSort}
          onPrimary
        />
      ),
      cell: (info) =>
        info.getValue() === "Active" ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    }),
    columnHelper.display({
      id: "actions",
      size: 90,
      enableHiding: false,
      header: "",
      cell: ({ row }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-kit-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          {row.getIsExpanded() ? "Close" : "Detail"}
        </button>
      ),
    }),
  ] as ColumnDef<FakeRow, unknown>[];

  const table = useReactTable({
    data: pageRows,
    columns,
    state: {
      rowSelection,
      expanded,
    },
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getRowId: (row: FakeRow) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  return (
    <DemoPageShell
      title="DataTable"
      subtitle="Responsive table demo: search, sort, select, columns, paging, detail expand."
    >
      <DemoSection title="Staff list (fake data)">
        {selectedCount > 0 ? (
          <TableSelectionBar
            count={selectedCount}
            onClear={() => setRowSelection({})}
          />
        ) : null}

        <TablePageShell>
          <div className="border-b border-kit px-4 pt-4">
            <DataTableToolbar
              searchValue={searchValue}
              onSearchChange={(value: string) => {
                setSearchValue(value);
                setPageIndex(1);
              }}
              searchPlaceholder="Search name, email, branch, role..."
            >
              <DataTableViewOptions table={table} columnLabels={columnLabels} />
            </DataTableToolbar>
          </div>

          <DataTable
            table={table}
            emptyState={
              <TableEmptyState
                icon={User}
                title="No matching rows"
                hint="Try another search keyword."
              />
            }
            renderExpandedRow={({ row }) => (
              <DemoDetailExpanded
                row={row.original}
                onEdit={() => {
                  window.alert("Edit demo: " + row.original.name);
                }}
              />
            )}
            pagination={
              <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 text-xs text-kit-muted">
                  <span>
                    {totalCount === 0
                      ? "0"
                      : (safePage - 1) * pageSize + 1}
                    -
                    {Math.min(safePage * pageSize, totalCount)} / {totalCount}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(1);
                    }}
                    className="h-8 cursor-pointer rounded border border-kit bg-kit-white px-2 text-xs text-kit-heading outline-none focus:border-kit-primary"
                  >
                    {[5, 10, 20].map((size: number) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                </div>
                <Pagination
                  page={safePage}
                  pageCount={totalPages}
                  onPageChange={setPageIndex}
                  size="sm"
                />
              </div>
            }
          />
        </TablePageShell>
      </DemoSection>
    </DemoPageShell>
  );
}
