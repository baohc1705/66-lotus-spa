import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { type MenuItem, type SubMenuItem } from "../constants/menu";
import { useMenuByRole } from "../hooks/useMenuByRole";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  toggleSidebar: () => void;
  layoutMode: "top-nav" | "sidebar";
}

export function AdminSidebar({
  isOpen,
  isMobileOpen,
  setMobileOpen,
  toggleSidebar,
  layoutMode,
}: AdminSidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const visibleGroups = useMenuByRole();

  const toggleMenu = (label: string) => {
    if (!isOpen) return;
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const checkIsActive = (path?: string, children?: SubMenuItem[]) => {
    if (path && location.pathname === path) return true;
    if (children)
      return children.some((child) => location.pathname === child.path);
    return false;
  };

  const renderItem = (item: MenuItem, index: number) => {
    const isActive = checkIsActive(item.path, item.children);
    const isExpanded = openMenus[item.label] || (isActive && isOpen);
    const Icon = item.icon;

    return (
      <motion.li
        key={item.label}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        {item.children ? (
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu(item.label)}
              className={cn(
                "admin-sidebar-nav-item flex items-center rounded-admin transition-all duration-200 group relative",
                isActive && "is-active",
                isOpen
                  ? "w-full p-3 justify-between"
                  : "w-12 h-12 mx-auto justify-center",
              )}
              title={!isOpen ? item.label : undefined}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Icon
                  className={cn(
                    "w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300",
                    isActive && "scale-110",
                  )}
                />
                {isOpen && (
                  <span className="font-sans font-medium text-sm tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </div>
              {isOpen && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 opacity-70 transition-transform duration-300",
                    isExpanded && "rotate-180",
                  )}
                />
              )}
            </button>

            <AnimatePresence>
              {isOpen && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="pl-3 pr-1 space-y-1 py-1">
                    {item.children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      const ChildIcon = child.icon;
                      return (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            className={cn(
                              "admin-sidebar-nav-child flex items-center gap-2 py-2 px-3 rounded-admin text-xs transition-all duration-200",
                              isChildActive && "is-active font-semibold",
                            )}
                          >
                            {ChildIcon && (
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">
                              {child.label}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to={item.path!}
            className={cn(
              "admin-sidebar-nav-item flex items-center rounded-admin transition-all duration-200 group relative",
              isActive && "is-active",
              isOpen
                ? "w-full p-3 gap-3"
                : "w-12 h-12 mx-auto justify-center",
            )}
            title={!isOpen ? item.label : undefined}
          >
            <Icon
              className={cn(
                "w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300",
                isActive && "scale-110",
              )}
            />
            {isOpen && (
              <span className="font-sans font-medium text-sm tracking-wide whitespace-nowrap">
                {item.label}
              </span>
            )}
            {!isOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-adminInk text-white text-xs rounded-admin opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                {item.label}
              </div>
            )}
          </Link>
        )}
      </motion.li>
    );
  };

  return (
    <>
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-adminInk/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        layout
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-adminGreen-800 border-r border-white/10 shadow-xl transition-all duration-500 ease-out",
          layoutMode === "sidebar"
            ? isOpen
              ? "w-64 lg:translate-x-0"
              : "w-20 lg:translate-x-0"
            : "lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={`shrink-0 px-4 overflow-hidden transition-all duration-500 ${isOpen ? "justify-between" : "justify-center"}`}
        >
          <div
            className={`h-16 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}
          >
            <div
              className={`transition-opacity duration-300 ${!isOpen ? "opacity-0 hidden" : "opacity-100 block"}`}
            >
              <Logo variant="light" size="sm" showTagline={false} />
            </div>

            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-10 h-10 rounded-admin text-adminGreen-100 items-center justify-center hover:bg-white/10 hover:text-white transition-all duration-300 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 hide-scrollbar">
          <div className="space-y-4">
            {visibleGroups.map((group) => (
              <div key={group.title ?? "main"}>
                {group.title && isOpen && (
                  <p className="admin-sidebar-section-title px-3 mb-1.5 text-2xs font-semibold uppercase tracking-wider">
                    {group.title}
                  </p>
                )}
                {group.title && !isOpen && (
                  <div className="mx-auto mb-1.5 h-px w-6 bg-white/10" />
                )}
                <ul className="space-y-1">
                  <AnimatePresence>
                    {group.items.map((item, index) =>
                      renderItem(item, index),
                    )}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
