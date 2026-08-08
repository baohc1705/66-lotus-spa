import { FileOutput, MapPin } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { TabNav } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Dropdown } from "@/shared/elements/Dropdown";
import type { RevenueReportGrain } from "../types/revenue.types";

type SalonOption = { id: number; name: string };
type CategoryOption = { id: number; name: string };

type Props = {
  showSalon?: boolean;
  showGrain?: boolean;
  showCategory?: boolean;
  salons?: SalonOption[];
  categories?: CategoryOption[];
  salonId: number | null;
  categoryId?: number | null;
  from: string;
  to: string;
  grain?: RevenueReportGrain;
  onSalonChange?: (id: number | null) => void;
  onCategoryChange?: (id: number | null) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onGrainChange?: (g: RevenueReportGrain) => void;
  onExport: () => void;
  exporting?: boolean;
};

const GRAINS: { key: RevenueReportGrain; label: string }[] = [
  { key: "day", label: "Ngày" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "quarter", label: "Quý" },
  { key: "year", label: "Năm" },
];

const DATE_INPUT =
  "h-8 rounded border border-kit bg-kit-white px-2.5 text-xs font-semibold " +
  "text-kit-heading outline-hidden focus:border-kit-primary";

export function ReportFilterBar({
  showSalon,
  showGrain,
  showCategory,
  salons = [],
  categories = [],
  salonId,
  categoryId,
  from,
  to,
  grain,
  onSalonChange,
  onCategoryChange,
  onFromChange,
  onToChange,
  onGrainChange,
  onExport,
  exporting,
}: Props) {
  const isAdmin = useAuthStore((s) => s.hasRole("Admin"));
  const mySalon = useAuthStore((s) => s.mySalon);

  const selectedSalonName =
    salons.find((s: SalonOption) => s.id === salonId)?.name ??
    "Tất cả chi nhánh";
  const managerSalonName =
    salons.find((s: SalonOption) => s.id === salonId)?.name ??
    mySalon?.salonName ??
    "Chi nhánh của bạn";
  const selectedCategoryName =
    categories.find((c: CategoryOption) => c.id === categoryId)?.name ??
    "Tất cả danh mục";

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-kit bg-kit-white p-2.5 shadow-kit-card">
      <div className="flex flex-wrap items-center gap-2">
        {showSalon && isAdmin ? (
          <Dropdown
            variant="outline-secondary"
            size="sm"
            className="!mb-0 !mr-0"
            label={selectedSalonName}
            items={[
              {
                type: "item",
                label: "Tất cả chi nhánh",
                onClick: () => onSalonChange?.(null),
              },
              ...salons.map((s: SalonOption) => ({
                type: "item" as const,
                label: s.name,
                onClick: () => onSalonChange?.(s.id),
              })),
            ]}
          />
        ) : null}

        {showSalon && !isAdmin ? (
          <div className="inline-flex h-8 items-center gap-1.5 rounded border border-kit bg-kit-page px-2.5 text-xs font-semibold text-kit-heading">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-kit-muted" />
            <span className="max-w-56 truncate">{managerSalonName}</span>
          </div>
        ) : null}

        {showCategory ? (
          <Dropdown
            variant="outline-secondary"
            size="sm"
            className="!mb-0 !mr-0"
            label={selectedCategoryName}
            items={[
              {
                type: "item",
                label: "Tất cả danh mục",
                onClick: () => onCategoryChange?.(null),
              },
              ...categories.map((c: CategoryOption) => ({
                type: "item" as const,
                label: c.name,
                onClick: () => onCategoryChange?.(c.id),
              })),
            ]}
          />
        ) : null}

        {showGrain && grain && onGrainChange ? (
          <TabNav
            items={GRAINS.map((g) => ({ id: g.key, label: g.label }))}
            activeId={grain}
            onChange={(id) => onGrainChange(id as RevenueReportGrain)}
            variant="btn-outline-alternate-pill"
            className="mb-0"
          />
        ) : null}

        <input
          type="date"
          className={DATE_INPUT}
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
        <span className="text-kit-muted">–</span>
        <input
          type="date"
          className={DATE_INPUT}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        className="!mb-0 !mr-0"
        onClick={onExport}
        disabled={exporting}
        loading={exporting}
      >
        <FileOutput className="mr-1.5 h-4 w-4" />
        {exporting ? "Đang xuất..." : "Xuất Excel"}
      </Button>
    </div>
  );
}
