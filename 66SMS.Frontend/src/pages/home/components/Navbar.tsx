import React, { useState, useEffect } from 'react';
import { Calendar, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from '@/assets/logo-home.png';

const NAV_ITEMS = [
  { label: 'Giới Thiệu',  href: '#ve-chung-toi' },
  { label: 'Dịch Vụ',     href: '#dich-vu' },
  { label: 'Sản Phẩm',    href: '#san-pham' },
  { label: 'Tin Tức',     href: '#tin-tuc' },
  { label: 'Liên Hệ',     href: '#lien-he' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-lotus-background shadow-jade border-b border-lotus-primary/10 h-[68px]' : 'bg-transparent h-[80px]'}`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 select-none group cursor-pointer">
            <img
              src={logoUrl}
              alt="Hoa Sen Spa Logo"
              className={`h-10 w-auto object-contain shrink-0 filter drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 ${!scrolled ? "brightness-0 invert opacity-90" : ""}`.trim()}
            />
            <div className="flex flex-col leading-none justify-center">
              <span className={`font-display font-semibold text-lg tracking-wide transition-colors duration-500 ${scrolled ? 'text-lotus-primary' : 'text-white'}`}>
                HOA SEN SPA
              </span>
              <span className={`text-[8px] tracking-[0.28em] uppercase font-sans transition-colors duration-500 mt-0.5 ${scrolled ? 'text-lotus-accent' : 'text-white/60'}`}>
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
                className={`nav-link relative font-sans text-[13px] font-medium tracking-wide transition-colors duration-300 group ${scrolled ? 'text-lotus-foreground hover:text-lotus-primary' : 'text-white/80 hover:text-white'}`}
              >
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-300 rounded-full ${scrolled ? 'bg-lotus-primary' : 'bg-white'}`} />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:09079593951"
              className={`flex items-center gap-1.5 font-sans text-[13px] font-medium transition-colors duration-300 ${scrolled ? 'text-lotus-foreground/70 hover:text-lotus-primary' : 'text-white/70 hover:text-white'}`}
            >
              <Phone className="w-3.5 h-3.5" />
              0907 95 93 95
            </a>
            <a
              href="#dat-lich"
              className="flex items-center gap-2 bg-lotus-primary hover:bg-lotus-foreground text-white text-[13px] font-medium px-5 py-2.5 rounded-full transition-all duration-300 shadow-jade hover:shadow-jade-lg hover:-translate-y-px active:translate-y-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              Đặt Lịch
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-lotus-foreground' : 'text-white'}`}
            aria-label="Mở menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="fixed inset-x-0 top-[68px] z-40 bg-lotus-background border-b border-lotus-primary/10 shadow-jade-lg lg:hidden"
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
                  className="font-sans text-base font-medium text-lotus-foreground hover:text-lotus-primary py-3 border-b border-lotus-muted/20 last:border-0 transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href="#dat-lich"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 bg-lotus-primary text-white text-sm font-medium px-6 py-3.5 rounded-full"
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
