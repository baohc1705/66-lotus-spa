import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Package,
  Leaf,
  Droplets,
  Sparkles,
  Droplet,
  Flower,
  Smile,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import { ProductCategoryFormDialog } from "@/features/product_categories/components/ProductCategoryFormDialog";
import { useAdminProducts, useDeletedProducts } from "../hooks/useProducts";

interface ProductCategorySidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  showDeleted: boolean;
}

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("tất cả")) return Package;
  if (n.includes("da") || n.includes("skin")) return Leaf;
  if (n.includes("tóc") || n.includes("hair")) return Sparkles;
  if (n.includes("rửa mặt") || n.includes("cleanser")) return Droplet;
  if (n.includes("dầu") || n.includes("oil")) return Droplets;
  if (n.includes("kem") || n.includes("cream")) return Flower;
  if (n.includes("nạ") || n.includes("mask")) return Smile;
  if (n.includes("serum") || n.includes("essence")) return Droplet;
  if (n.includes("tẩy") || n.includes("remover")) return Sparkles;
  if (n.includes("toner") || n.includes("nước hoa hồng")) return Droplet;
  return Tag;
}

export function ProductCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  showDeleted,
}: ProductCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { data: categoriesResult, isLoading: isLoadingCategories } =
    useProductCategories({ pageIndex: 1, pageSize: 100 });

  const categories = useMemo(
    () => categoriesResult?.data?.items ?? [],
    [categoriesResult?.data?.items],
  );

  // Fetch all active/deleted products without category filter for counting
  const { data: activeProductsResult } = useAdminProducts(
    { pageIndex: 1, pageSize: 10000 },
    !showDeleted,
  );
  const { data: deletedProductsResult } = useDeletedProducts(
    { pageIndex: 1, pageSize: 10000 },
    showDeleted,
  );

  const countProducts = useMemo(() => {
    const res = showDeleted ? deletedProductsResult : activeProductsResult;
    return res?.data?.items ?? [];
  }, [showDeleted, activeProductsResult, deletedProductsResult]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of countProducts) {
      if (p.categoryId != null) {
        map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [countProducts]);

  const totalCount = countProducts.length;

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
          {/* Tất cả sản phẩm */}
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
              <Package
                className={`w-4 h-4 shrink-0 ${
                  selectedCategoryId === null
                    ? "text-lotus-leaf"
                    : "text-stone-400"
                }`}
              />
              <span className="truncate">Tất cả sản phẩm</span>
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

      <ProductCategoryFormDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />
    </>
  );
}
