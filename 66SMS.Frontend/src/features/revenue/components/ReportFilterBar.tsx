import { useAuthStore } from "@/features/auth/stores/authStore";
import { Button } from "@/shared/components/ui/button";
import { FileOutput, MapPin } from "lucide-react";
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

  const managerSalonName =
    salons.find((s: SalonOption) => s.id === salonId)?.name ??
    mySalon?.salonName ??
    "Chi nhánh của bạn";

  return (
    <div className="flex flex-wrap items-center gap-2 justify-between bg-white border rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2">
        {showSalon && isAdmin && (
          <select
            className="border rounded px-2 py-1.5 text-sm"
            value={salonId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onSalonChange?.(v === "" ? null : Number(v));
            }}
          >
            <option value="">Tất cả chi nhánh</option>
            {salons.map((s: SalonOption) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {showSalon && !isAdmin && (
          <div className="flex items-center gap-1.5 border rounded px-2.5 py-1.5 text-sm text-slate-700 bg-slate-50">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-[220px]">{managerSalonName}</span>
          </div>
        )}

        {showCategory && (
          <select
            className="border rounded px-2 py-1.5 text-sm"
            value={categoryId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onCategoryChange?.(v === "" ? null : Number(v));
            }}
          >
            <option value="">Tất cả</option>
            {categories.map((c: CategoryOption) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {showGrain && grain && onGrainChange && (
          <div className="flex border rounded overflow-hidden text-sm">
            {GRAINS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={`px-2.5 py-1.5 ${
                  grain === g.key ? "bg-blue-600 text-white" : "bg-white"
                }`}
                onClick={() => onGrainChange(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        <input
          type="date"
          className="border rounded px-2 py-1.5 text-sm"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
        <span className="text-slate-400">–</span>
        <input
          type="date"
          className="border rounded px-2 py-1.5 text-sm"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="admin"
        size="sm"
        onClick={onExport}
        disabled={exporting}
      >
        <FileOutput className="w-4 h-4 mr-1" />
        {exporting ? "Đang xuất..." : "Xuất Excel"}
      </Button>
    </div>
  );
}
