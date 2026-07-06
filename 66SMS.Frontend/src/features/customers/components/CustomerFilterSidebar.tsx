import {
  Users,
  Store,
  Globe,
  Heart,
  Share2,
  Filter,
} from "lucide-react";

interface CustomerFilterSidebarProps {
  selectedGender: number | null;
  onSelectGender: (gender: number | null) => void;
  selectedSource: string | null;
  onSelectSource: (source: string | null) => void;
}

const GENDER_OPTIONS = [
  { value: null, label: "Tất cả giới tính" },
  { value: 0, label: "Nam" },
  { value: 1, label: "Nữ" },
  { value: 2, label: "Khác" },
];

const SOURCE_OPTIONS = [
  { value: null, label: "Tất cả nguồn" },
  { value: "Walk-in", label: "Đến trực tiếp", icon: Store },
  { value: "Online", label: "Online", icon: Globe },
  { value: "Referral", label: "Giới thiệu", icon: Heart },
  { value: "Social Media", label: "Mạng xã hội", icon: Share2 },
];

export function CustomerFilterSidebar({
  selectedGender,
  onSelectGender,
  selectedSource,
  onSelectSource,
}: CustomerFilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white rounded border border-stone-200/60 overflow-hidden">
      {/* Title */}
      <div className="px-4 py-3 border-b border-stone-100 shrink-0 flex items-center gap-2">
        <Filter className="w-4 h-4 text-lotus-leaf" />
        <span className="text-lotus-admin-lg font-bold text-lotus-deep">Bộ lọc khách hàng</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
        {/* Section 1: Giới tính */}
        <div className="space-y-1.5">
          <p className="text-lotus-admin-base font-bold text-stone-400 tracking-wider uppercase px-2">
            Giới tính
          </p>
          <div className="space-y-0.5">
            {GENDER_OPTIONS.map((opt) => {
              const isActive = selectedGender === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSelectGender(opt.value)}
                  className={`lotus-admin-sidebar-item ${
                    isActive
                      ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                      : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
                  }`}
                >
                  <Users
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-lotus-leaf" : "text-stone-400"
                    }`}
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Nguồn khách */}
        <div className="space-y-1.5">
          <p className="text-lotus-admin-base font-bold text-stone-400 tracking-wider uppercase px-2">
            Nguồn khách
          </p>
          <div className="space-y-0.5">
            {SOURCE_OPTIONS.map((opt) => {
              const isActive = selectedSource === opt.value;
              const Icon = opt.icon || Users;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSelectSource(opt.value)}
                  className={`lotus-admin-sidebar-item ${
                    isActive
                      ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                      : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-lotus-leaf" : "text-stone-400"
                    }`}
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
