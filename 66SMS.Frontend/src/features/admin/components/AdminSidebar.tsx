import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { type SubMenuItem } from "../constants/menu";
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

  const visibleMenuItems = useMenuByRole();

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

  return (
    <>
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-lotus-deep/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        layout
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-lotus-cream/95 backdrop-blur-md shadow-xl transition-all duration-500 ease-out",
          layoutMode === "sidebar"
            ? isOpen
              ? "w-64 lg:translate-x-0"
              : "w-20 lg:translate-x-0"
            : "lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
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
              <Logo variant="dark" size="sm" showTagline={false} />
            </div>

            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-10 h-10 rounded-admin text-lotus-leaf items-center justify-center hover:bg-lotus-leaf/10 transition-all duration-300 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 hide-scrollbar">
          <ul className="space-y-2">
            <AnimatePresence>
              {visibleMenuItems.map((item, index) => {
                const isActive = checkIsActive(item.path, item.children);
                const isExpanded =
                  openMenus[item.label] || (isActive && isOpen);
                const Icon = item.icon;

                return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.children ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={`flex items-center rounded-admin transition-all duration-300 group relative ${isActive ? "bg-lotus-leaf text-white shadow-md" : "text-lotus-deep/70 hover:bg-lotus-leaf/10 hover:text-lotus-deep"} ${isOpen ? "w-full p-3 justify-between" : "w-12 h-12 mx-auto justify-center"}`}
                          title={!isOpen ? item.label : undefined}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Icon
                              className={`w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
                            />
                            {isOpen && (
                              <span className="font-sans font-medium text-[13px] tracking-wide whitespace-nowrap">
                                {item.label}
                              </span>
                            )}
                          </div>
                          {isOpen && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
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
                              <ul className="pl-9 pr-2 space-y-1 py-1 relative before:content-[''] before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-px before:bg-lotus-leaf/20">
                                {item.children.map((child) => {
                                  const isChildActive =
                                    location.pathname === child.path;
                                  const ChildIcon = child.icon;
                                  return (
                                    <li key={child.path}>
                                      <Link
                                        to={child.path}
                                        className={`flex items-center gap-2 py-2 px-3 rounded-admin text-xs transition-all duration-300 relative ${isChildActive ? 'text-lotus-leaf font-semibold bg-lotus-leaf/10 before:content-[""] before:absolute before:-left-[1.35rem] before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-lotus-leaf' : "text-lotus-deep/60 hover:text-lotus-deep hover:bg-lotus-leaf/5"}`}
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
                        className={`flex items-center rounded-admin transition-all duration-300 group relative ${isActive ? "bg-lotus-leaf text-white shadow-md" : "text-lotus-deep/70 hover:bg-lotus-leaf/10 hover:text-lotus-deep"} ${isOpen ? "w-full p-3 gap-3" : "w-12 h-12 mx-auto justify-center"}`}
                        title={!isOpen ? item.label : undefined}
                      >
                        <Icon
                          className={`w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
                        />
                        {isOpen && (
                          <span className="font-sans font-medium text-[13px] tracking-wide whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                        {!isOpen && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-lotus-deep text-lotus-cream text-xs rounded-admin opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </motion.aside>
    </>
  );
}
