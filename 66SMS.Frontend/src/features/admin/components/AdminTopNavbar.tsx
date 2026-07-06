import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { TOP_NAV_TABS, type ParentTab } from "../constants/menu";

export function AdminTopNavbar() {
  const { hasRole } = useAuthStore();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = (tab: string) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveTab(tab);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setActiveTab(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Helper checking if a menu item is accessible by user's role
  const checkPermission = (allowedRoles?: string[]): boolean => {
    const isAdmin = hasRole("Admin");
    if (isAdmin) return true;
    if (!allowedRoles || allowedRoles.length === 0) return false;
    return allowedRoles.some((r) => hasRole(r));
  };

  const tabs: ParentTab[] = TOP_NAV_TABS.filter((t) => checkPermission(t.allowedRoles));

  // Determine if a parent tab has an active sub-item
  const isParentActive = (tab: ParentTab) => {
    if (tab.path && location.pathname === tab.path) return true;
    if (tab.columns) {
      return tab.columns.some((col) =>
        col.items.some((item) => location.pathname === item.path)
      );
    }
    return false;
  };

  return (
    <nav className="hidden lg:flex items-center gap-0.5 h-full">
      {tabs.map((tab) => {
        const isActive = isParentActive(tab);
        const hasColumns = !!tab.columns && tab.columns.length > 0;
        const isTabOpen = activeTab === tab.label;
        const Icon = tab.icon;

        return (
          <div
            key={tab.label}
            className="relative h-full flex items-center"
            onMouseEnter={() => handleMouseEnter(tab.label)}
            onMouseLeave={handleMouseLeave}
          >
            {tab.path ? (
              <Link
                to={tab.path}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-sans text-[13px] font-normal whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-80"
                    }`}
                  />
                )}
                <span>{tab.label}</span>
              </Link>
            ) : (
              <button
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-sans text-[13px] font-normal whitespace-nowrap transition-all duration-300 outline-none ${
                  isActive
                    ? "text-white"
                    : isTabOpen
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-80"
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    isTabOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {isActive && (
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-white rounded-full animate-in fade-in-0 duration-300" />
            )}

            {/* Dropdown / Mega Menu Card */}
            <AnimatePresence>
              {hasColumns && isTabOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.99 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute top-full left-0 mt-0.5 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] rounded-[4px] p-4 z-50 grid gap-5`}
                  style={{
                    gridTemplateColumns: `repeat(${tab.columns?.length ?? 3}, minmax(160px, 1fr))`,
                    minWidth: `${(tab.columns?.length ?? 3) * 180 + 32}px`,
                  }}
                >
                  {tab.columns?.map((col) => {
                    const visibleItems = col.items.filter((item) =>
                      checkPermission(item.allowedRoles)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={col.title} className="flex flex-col">
                        <span className="text-[11px] font-medium text-lotus-stone/85 mb-2 select-none whitespace-nowrap capitalize">
                          {col.title.toLowerCase()}
                        </span>
                        <ul className="space-y-0.5">
                          {visibleItems.map((item) => {
                            const isItemActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                              <li key={item.path}>
                                <Link
                                  to={item.path}
                                  onClick={() => setActiveTab(null)}
                                  className={`group flex items-center gap-2 px-2 py-1 rounded-[4px] text-[12px] transition-all duration-300 ${
                                    isItemActive
                                      ? "bg-lotus-surface/30 text-lotus-primary font-semibold"
                                      : "text-lotus-deep/80 hover:text-lotus-primary hover:bg-lotus-cream"
                                  }`}
                                >
                                  <Icon
                                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                                      isItemActive
                                        ? "text-lotus-primary scale-110"
                                        : "text-lotus-deep/40 group-hover:text-lotus-primary group-hover:scale-110"
                                    }`}
                                  />
                                  <span className="whitespace-nowrap truncate">
                                    {item.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
