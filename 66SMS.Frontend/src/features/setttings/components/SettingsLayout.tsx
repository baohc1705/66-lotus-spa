import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsHeader } from "./SettingsHeader";

const COLLAPSE_BREAKPOINT = 1250;
const MOBILE_BREAKPOINT = 768;

export function SettingsLayout() {
  const location = useLocation();
  const [sidebarClosed, setSidebarClosed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < COLLAPSE_BREAKPOINT
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (location.pathname === "/demo" || location.pathname === "/demo/") {
    return <Navigate to="/demo/dashboards/example-1" replace />;
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
      <SettingsHeader
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
          <SettingsSidebar
            closed={closed}
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>

        {mobileOpen && isMobile ? (
          <button
            type="button"
            className="sidebar-mobile-overlay fixed inset-0 top-15 z-30 bg-gray-800/60"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="app-main__outer flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="app-main__inner min-h-0 flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
            <footer className="app-footer border-t border-kit bg-white px-6 py-3">
              <div className="flex flex-wrap gap-4 text-xs text-kit-muted">
                <span>Footer Link 1</span>
                <span>Footer Link 2</span>
                <span>Footer Link 3</span>
                <span>
                  Footer Link 4{" "}
                  <span className="ml-1 rounded bg-green-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    NEW
                  </span>
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
