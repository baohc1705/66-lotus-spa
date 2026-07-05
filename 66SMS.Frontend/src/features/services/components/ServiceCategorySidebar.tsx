import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Activity,
  Sparkles,
  Heart,
  Flower,
  Smile,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import { ServiceCategoryFormDialog } from "@/features/service_categories/components/ServiceCategoryFormDialog";
import { useAdminServices, useDeletedServices } from "../hooks/useServices";

interface ServiceCategorySidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  showDeleted: boolean;
}

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("tất cả")) return Activity;
  if (n.includes("da") || n.includes("skin")) return Sparkles;
  if (n.includes("tóc") || n.includes("hair")) return Star;
  if (n.includes("massage") || n.includes("trị liệu")) return Heart;
  if (n.includes("móng") || n.includes("nail")) return Flower;
  if (n.includes("mặt") || n.includes("facial")) return Smile;
  return Tag;
}

export function ServiceCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  showDeleted,
}: ServiceCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { data: categoriesResult, isLoading: isLoadingCategories } =
    useServiceCategories({ pageIndex: 1, pageSize: 100 });

  const categories = useMemo(
    () => categoriesResult?.data?.items ?? [],
    [categoriesResult?.data?.items],
  );

  // Fetch all active/deleted services without category filter for counting
  const { data: activeServicesResult } = useAdminServices(
    { pageIndex: 1, pageSize: 10000 },
    !showDeleted,
  );
  const { data: deletedServicesResult } = useDeletedServices(
    { pageIndex: 1, pageSize: 10000 },
    showDeleted,
  );

  const countServices = useMemo(() => {
    const res = showDeleted ? deletedServicesResult : activeServicesResult;
    return res?.data?.items ?? [];
  }, [showDeleted, activeServicesResult, deletedServicesResult]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const s of countServices) {
      if (s.categoryId != null) {
        map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [countServices]);

  const totalCount = countServices.length;

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const lower = searchText.toLowerCase();
    return categories.filter((c) =>
      (c.name ?? "").toLowerCase().includes(lower),
    );
  }, [categories, searchText]);

  return (
    <>
      <aside className="w-2/12 shrink-0 flex flex-col h-full bg-white rounded overflow-hidden">
        {/* Search */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full h-8 pl-8 pr-3 text-[12px] bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-lotus-leaf/40 focus:border-lotus-leaf/60 placeholder:text-stone-400 text-stone-700"
            />
          </div>
        </div>

        {/* Category list */}
        <nav className="flex-1 flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-2 space-y-0.5">
          {/* Tất cả dịch vụ */}
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] transition-all duration-150 rounded ${
              selectedCategoryId === null
                ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity
                className={`w-4 h-4 shrink-0 ${
                  selectedCategoryId === null
                    ? "text-lotus-leaf"
                    : "text-stone-400"
                }`}
              />
              <span className="truncate">Tất cả dịch vụ</span>
            </div>
            <span
              className={`text-[11px] shrink-0 font-medium px-1.5 py-0.5 rounded-full ${
                selectedCategoryId === null
                  ? "bg-lotus-leaf/20 text-lotus-leaf"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {isLoadingCategories ? (
            <div className="space-y-1 px-1 mt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 bg-stone-100/50 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              const count = cat.id != null ? (countMap.get(cat.id) ?? 0) : 0;
              const Icon = getCategoryIcon(cat.name ?? "");
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id ?? null)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] transition-all duration-150 rounded group ${
                    isActive
                      ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                      : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? "text-lotus-leaf"
                          : "text-stone-400 group-hover:text-stone-500"
                      }`}
                    />
                    <span className="truncate">{cat.name ?? "—"}</span>
                  </div>
                  <span
                    className={`text-[11px] shrink-0 font-medium px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-lotus-leaf/20 text-lotus-leaf"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })
          )}
        </nav>

        {/* Footer: Tạo danh mục */}
        <div className="px-3 py-2 shrink-0 mt-auto">
          <Button
            variant="admin"
            className="w-full h-8 text-[12px] gap-1.5 justify-center font-bold"
            onClick={() => setCreateCategoryOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm danh mục
          </Button>
        </div>
      </aside>

      <ServiceCategoryFormDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />
    </>
  );
}
