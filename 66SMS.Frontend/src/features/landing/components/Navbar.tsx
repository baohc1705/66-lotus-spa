import { useState, useEffect } from "react";
import { Calendar, Menu, X, Phone, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoUrl from "@/assets/logo-home.png";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useGetMe } from "@/features/users";
import { Button } from "./Button";

const NAV_ITEMS = [
  { label: "Giới thiệu", href: "#about" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Sản phẩm", href: "#products" },
  { label: "Phòng riêng", href: "#space" },
  { label: "Đánh giá", href: "#testimonials" },
  { label: "Câu hỏi", href: "#faq" },
];

interface NavbarProps {
  alwaysDark?: boolean;
}

export const Navbar = ({ alwaysDark = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!accessToken;
  const { data: me } = useGetMe();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isDark = scrolled || alwaysDark;

  return (
    <>
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav--scrolled h-[68px]" : alwaysDark ? "nav--scrolled h-[68px]" : "bg-transparent h-[80px]"}`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3 select-none group cursor-pointer"
          >
            <img
              src={logoUrl}
              alt="Hoa Sen Spa Logo"
              loading="eager"
              width={40}
              height={40}
              className={`h-10 w-auto object-contain shrink-0 filter drop-shadow-sm transition-all duration-500 ease-out group-hover:scale-105 ${!isDark ? "brightness-0 invert opacity-90" : ""}`.trim()}
            />
            <div className="flex flex-col leading-none justify-center">
              <span
                className={`font-display font-semibold text-lg tracking-wide transition-colors duration-500 ${isDark ? "text-rose-800" : "text-white"}`}
              >
                HOA SEN
              </span>
              <span
                className={`text-2xs tracking-[0.28em] uppercase font-sans mt-0.5 transition-colors duration-500 ${isDark ? "text-gold-600" : "text-white/60"}`}
              >
                Spa & Wellness
              </span>
            </div>
          </a>

          {/* Desktop Nav — tab style per color.md */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative font-sans text-xs font-medium uppercase tracking-wide transition-colors duration-300 group ${isDark ? "text-ink hover:text-rose-400" : "text-white/80 hover:text-white"}`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${isDark ? "bg-rose-600" : "bg-white"}`}
                />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:0337779999"
              className={`flex items-center gap-1.5 font-sans text-xs font-medium transition-colors duration-300 ${isDark ? "text-warm-600 hover:text-rose-600" : "text-white/70 hover:text-white"}`}
            >
              <Phone className="w-3.5 h-3.5" />
              0337 779 999
            </a>

            <div
              className={`w-px h-4 mx-1 ${isDark ? "bg-warm-100" : "bg-white/20"}`}
            />

            {isLoggedIn ? (
              <a
                href="/profile"
                className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${isDark ? "text-ink hover:text-rose-600" : "text-white/90 hover:text-white"}`}
              >
                <div className="w-7 h-7 rounded-full border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 overflow-hidden">
                  {me?.avatarUrl ? (
                    <img
                      src={me.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="max-w-[100px] truncate">
                  {me?.fullName ?? me?.username ?? "Tài khoản"}
                </span>
              </a>
            ) : (
              <a
                href="/login"
                className={`flex items-center gap-1.5 font-sans text-xs font-medium transition-colors duration-300 ${isDark ? "text-ink hover:text-rose-600" : "text-white/90 hover:text-white"}`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Đăng nhập
              </a>
            )}

            <Button
              href="/dat-lich"
              id="nav-cta-booking"
              variant="primary"
              className="px-5 py-2.5 text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              Đặt Lịch
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 transition-colors ${isDark ? "text-ink" : "text-white"}`}
            aria-label="Mở menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[68px] z-40 bg-surface border-b border-card-border shadow-jade-lg lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-base font-medium text-ink hover:text-rose-600 py-3 border-b border-warm-100 last:border-0 transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
              <div className="pt-4 border-t border-warm-100 flex flex-col gap-2 mt-2">
                {isLoggedIn ? (
                  <a
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 font-sans text-base font-medium text-ink hover:text-rose-600 py-2 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      {me?.avatarUrl ? (
                        <img
                          src={me.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    Tài khoản ({me?.fullName ?? me?.username ?? "Cá nhân"})
                  </a>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 font-sans text-base font-medium text-ink hover:text-rose-600 py-2 transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                    Đăng nhập
                  </a>
                )}
                <Button
                  href="/dat-lich"
                  onClick={() => setMenuOpen(false)}
                  variant="primary"
                  className="mt-2 w-full py-3.5 text-xs"
                >
                  <Calendar className="w-4 h-4" />
                  Đặt Lịch Ngay
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
