import { MapPin } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function BranchSelector() {
  const { data: salons = [], isLoading } = useActiveSalons();
  const selectedSalonId = useAuthStore((s) => s.selectedSalonId);
  const setSelectedSalonId = useAuthStore((s) => s.setSelectedSalonId);

  // Convert selected ID to string for Radix select or use "all" for null
  const value = selectedSalonId !== null ? selectedSalonId.toString() : "all";

  const handleValueChange = (val: string) => {
    if (val === "all") {
      setSelectedSalonId(null);
    } else {
      setSelectedSalonId(parseInt(val, 10));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-lotus-leaf/10 h-10 w-full rounded-admin border border-lotus-leaf/20 flex items-center justify-center text-xs text-lotus-leaf">
        Đang tải chi nhánh...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full bg-lotus-leaf/10 hover:bg-lotus-leaf/15 text-lotus-leaf border border-lotus-leaf/20 h-10 py-1.5 text-xs font-semibold focus:ring-lotus-leaf/20">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-lotus-leaf shrink-0" />
            <SelectValue placeholder="Chọn chi nhánh" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs font-medium focus:bg-lotus-cream/50">
            Tất cả chi nhánh
          </SelectItem>
          {salons.map((salon) => (
            <SelectItem
              key={salon.id}
              value={salon.id.toString()}
              className="text-xs font-medium focus:bg-lotus-cream/50"
            >
              {salon.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
