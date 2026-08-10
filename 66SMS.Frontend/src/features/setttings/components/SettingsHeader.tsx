import { Link } from "react-router-dom";
import { Database, FolderPen, Settings, Menu } from "lucide-react";

type SettingsHeaderProps = {
  sidebarClosed: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  mobileOpen: boolean;
};

export function SettingsHeader(props: SettingsHeaderProps) {
  return (
    <header className="app-header z-30 flex h-15 shrink-0 items-center bg-white shadow-sm">
      {/* Desktop logo + hamburger (Architect header__pane) — md+ */}
      <div
        className={
          "app-header__logo hidden h-full shrink-0 items-center border-r border-gray-100 " +
          "px-5 transition-all duration-300 md:flex " +
          (props.sidebarClosed ? "w-20 justify-center" : "w-70 justify-between")
        }
      >
        <Link
          to="/demo"
          className={
            "flex items-center gap-2 no-underline " +
            (props.sidebarClosed ? "hidden" : "")
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-kit-primary text-sm font-bold text-white">
            A
          </span>
          <span className="text-base font-bold tracking-tight text-kit-heading">ArchitectUI</span>
        </Link>
        <button
          type="button"
          onClick={props.onToggleSidebar}
          className={
            "hamburger hamburger--elastic desktop-toggle-nav inline-flex h-8 w-8 items-center " +
            "justify-center rounded text-kit-muted hover:bg-kit-page " +
            (props.sidebarClosed ? "is-active" : "")
          }
          aria-label="Toggle sidebar"
          aria-pressed={props.sidebarClosed}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile hamburger — < md */}
      <button
        type="button"
        onClick={props.onToggleMobile}
        className={
          "mobile-toggle-nav ml-3 inline-flex h-9 w-9 items-center justify-center rounded-md " +
          "border border-kit text-kit-body hover:bg-kit-page md:hidden " +
          (props.mobileOpen ? "is-active bg-kit-page" : "")
        }
        aria-label="Open menu"
        aria-pressed={props.mobileOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="app-header__content flex h-full flex-1 items-center px-4">
        <div className="hidden items-center md:flex">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Type to search"
              className="h-9 w-56 rounded-full border border-kit bg-kit-page px-4 text-sm text-kit-body outline-none focus:border-kit-primary focus:bg-white"
            />
          </div>
          <nav className="flex items-center gap-1">
            <a
              href="#"
              onClick={(e: { preventDefault(): void }) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-kit-muted no-underline hover:bg-kit-page hover:text-kit-heading"
            >
              <Database className="h-4 w-4 opacity-50" />
              Statistics
            </a>
            <a
              href="#"
              onClick={(e: { preventDefault(): void }) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-kit-muted no-underline hover:bg-kit-page hover:text-kit-heading"
            >
              <FolderPen className="h-4 w-4 opacity-50" />
              Projects
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-kit-muted no-underline hover:bg-kit-page hover:text-kit-heading"
            >
              <Settings className="h-4 w-4 opacity-50" />
              Home
            </Link>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-sm font-semibold text-kit-heading">Alina Mclourd</div>
            <div className="text-xs text-kit-muted">VP People Manager</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-kit-primary">
            AM
          </div>
        </div>
      </div>
    </header>
  );
}
