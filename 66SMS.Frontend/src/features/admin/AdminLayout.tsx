import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "@/shared/hooks/usePermission";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";

const COLLAPSE_BREAKPOINT = 1250;
const MOBILE_BREAKPOINT = 768;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { hasRole } = usePermission();
  const user = useAuthStore((s) => s.user);
  const isCustomer = hasRole("Customer");
  const hasAccess = !!user && !isCustomer;

  const [sidebarClosed, setSidebarClosed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < COLLAPSE_BREAKPOINT,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    function onResize() {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarClosed(width < COLLAPSE_BREAKPOINT);
      if (!mobile) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [lastPathname, setLastPathname] = useState(location.pathname);
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!hasAccess) {
      navigate("/");
    }
  }, [hasAccess, navigate]);

  const isStaffOrReceptionist =
    (hasRole("Staff") || hasRole("Receptionist")) &&
    !hasRole("Admin") &&
    !hasRole("Manager");

  useEffect(() => {
    if (hasAccess && isStaffOrReceptionist && location.pathname === "/admin") {
      navigate("/admin/staff/appointments", { replace: true });
    }
  }, [hasAccess, isStaffOrReceptionist, location.pathname, navigate]);

  if (!hasAccess) {
    return null;
  }

  const closed = isMobile ? false : sidebarClosed;

  return (
    <div
      className={
        "app-container flex h-screen flex-col overflow-hidden bg-kit-page font-sans text-sm text-kit-body " +
        (sidebarClosed && !isMobile ? "closed-sidebar closed-sidebar-mobile " : "") +
        (mobileOpen ? "sidebar-mobile-open " : "")
      }
    >
      <AdminHeader
        sidebarClosed={closed}
        mobileOpen={mobileOpen}
        onToggleSidebar={() => setSidebarClosed((prev) => !prev)}
        onToggleMobile={() => setMobileOpen((prev) => !prev)}
      />

      <div className="relative flex min-h-0 flex-1">
        <div
          className={
            "z-10 h-full shrink-0 transition-transform duration-300 " +
            (isMobile
              ? "fixed top-15 bottom-0 left-0 " +
                (mobileOpen ? "translate-x-0" : "-translate-x-full")
              : "h-full")
          }
        >
          <AdminSidebar
            closed={closed}
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        {mobileOpen && isMobile ? (
          <button
            type="button"
            className="sidebar-mobile-overlay fixed inset-0 top-15 z-30 bg-gray-800/60"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="app-main__outer flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="app-main__inner min-h-0 flex-1 overflow-y-auto">
            <div className="p-3 md:p-4">
              <Outlet context={{ layoutMode: "sidebar" as const }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
