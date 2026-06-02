import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Phone, User as UserIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/components/Logo";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useGetMe } from "@/features/users/hooks/useGetMe";
import { NAV_LINKS } from "@/features/spa/data/homeContent";

interface SpaNavbarProps {
  light?: boolean;
}

export function SpaNavbar({ light = false }: SpaNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasRole = useAuthStore((s) => s.hasRole);
  const { data: me } = useGetMe();
  const { mutate: logout } = useLogout();

  const isLoggedIn = !!accessToken;
  const canAccessAdmin = hasRole("Admin") || hasRole("SuperAdmin");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isDarkText = scrolled || !light;

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--spa-border)]"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo variant={isDarkText ? "dark" : "light"} showTagline />

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors duration-200",
                  isDarkText
                    ? "text-[var(--spa-text)] hover:text-[var(--spa-rose)]"
                    : "text-white/90 hover:text-white",
                )}
              >
                {link.label}
                {"hasDropdown" in link && link.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:19001234"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                isDarkText ? "text-[var(--spa-text)]" : "text-white",
              )}
            >
              <Phone className="w-4 h-4" />
              1900 1234
            </a>

            {isLoggedIn ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[var(--spa-border)]">
                {canAccessAdmin && (
                  <Link
                    to="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hidden xl:block",
                      isDarkText
                        ? "text-[var(--spa-text)] hover:text-[var(--spa-rose)]"
                        : "text-white/90 hover:text-white",
                    )}
                  >
                    Quản trị
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isDarkText
                      ? "text-[var(--spa-text)] hover:text-[var(--spa-rose)]"
                      : "text-white/90 hover:text-white",
                  )}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--spa-rose-light)] bg-[var(--spa-blush)] flex items-center justify-center text-[var(--spa-rose)]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="max-w-[120px] truncate">{me?.username ?? "Tài khoản"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "p-2 rounded-full hover:bg-gray-100 transition-colors",
                    isDarkText ? "text-gray-500" : "text-white/70 hover:bg-white/10",
                  )}
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button variant={isDarkText ? "secondary" : "ghost"} size="sm" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
            )}

            <Button size="sm" asChild>
              <Link to="/login">Đặt lịch ngay</Link>
            </Button>
          </div>

          <button
            type="button"
            className={cn("lg:hidden p-2 rounded-lg", isDarkText ? "text-[var(--spa-text)]" : "text-white")}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden bg-white border-t border-[var(--spa-border)] transition-all duration-300 overflow-hidden",
          mobileOpen ? "max-h-[520px]" : "max-h-0",
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {isLoggedIn && me && (
            <div className="flex items-center gap-3 p-3 bg-[var(--spa-blush)] rounded-2xl mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--spa-rose-light)] bg-white flex items-center justify-center text-[var(--spa-rose)]">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[var(--spa-text)]">{me.username}</p>
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="text-xs text-[var(--spa-rose)] font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                  {canAccessAdmin && (
                    <Link
                      to="/users"
                      className="text-xs text-[var(--spa-admin-primary)] font-semibold border-l border-[var(--spa-border)] pl-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      Quản lý người dùng
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 px-3 text-[var(--spa-text)] font-medium hover:text-[var(--spa-rose)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <div className="pt-3 border-t border-[var(--spa-border)] flex flex-col gap-2">
            {!isLoggedIn ? (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" className="w-full text-red-500" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            )}
            <Button className="w-full" asChild>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Đặt lịch ngay
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
