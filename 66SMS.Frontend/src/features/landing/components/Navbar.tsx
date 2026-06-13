import { useState, useEffect } from "react";
import { Calendar, Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoUrl from "@/assets/logo-home.png";

const NAV_ITEMS = [
  { label: "Giới Thiệu", href: "#about" },
  { label: "Dịch Vụ", href: "#services" },
  { label: "Không Gian", href: "#space" },
  { label: "Quy Trình", href: "#process" },
  { label: "Đánh Giá", href: "#testimonials" },
  { label: "Vị Trí", href: "#location" },
];

interface NavbarProps {
  alwaysDark?: boolean;
}

export const Navbar = ({ alwaysDark = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav--scrolled h-[68px]" : alwaysDark ? "bg-transparent h-[68px]" : "bg-transparent h-[80px]"}`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
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
                className={`font-display font-semibold text-lg tracking-wide transition-colors duration-500 ${isDark ? "text-lotus-rose" : "text-white"}`}
              >
                HOA SEN SPA
              </span>
              <span
                className={`text-[8px] tracking-[0.28em] uppercase font-sans mt-0.5 transition-colors duration-500 ${isDark ? "text-lotus-gold" : "text-white/60"}`}
              >
                Đồng Tháp
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative font-sans text-[13px] font-medium tracking-wide transition-colors duration-300 group ${isDark ? "text-lotus-deep hover:text-lotus-rose" : "text-white/80 hover:text-white"}`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-300 rounded-full ${isDark ? "bg-lotus-rose" : "bg-white"}`}
                />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:09079593951"
              className={`flex items-center gap-1.5 font-sans text-[13px] font-medium transition-colors duration-300 ${isDark ? "text-lotus-stone hover:text-lotus-rose" : "text-white/70 hover:text-white"}`}
            >
              <Phone className="w-3.5 h-3.5" />
              0907 95 93 95
            </a>
            <a
              href="/dat-lich"
              id="nav-cta-booking"
              className="flex items-center gap-2 bg-lotus-rose hover:bg-lotus-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-full transition-all duration-300 shadow-lotus hover:shadow-jade-lg hover:-translate-y-px active:translate-y-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              Đặt Lịch
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? "text-lotus-deep" : "text-white"}`}
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
            className="fixed inset-x-0 top-[68px] z-40 bg-lotus-cream border-b border-lotus-rose/10 shadow-jade-lg lg:hidden"
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
                  className="font-sans text-base font-medium text-lotus-deep hover:text-lotus-rose py-3 border-b border-lotus-stone/20 last:border-0 transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href="/dat-lich"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 bg-lotus-rose text-white text-sm font-medium px-6 py-3.5 rounded-full"
              >
                <Calendar className="w-4 h-4" />
                Đặt Lịch Ngay
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
