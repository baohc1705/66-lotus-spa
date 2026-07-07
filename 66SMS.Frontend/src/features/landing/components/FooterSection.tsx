import { useState } from 'react'
import { MapPin, Phone, Clock, Send, CheckCircle } from 'lucide-react'
import logoUrl from '@/assets/logo-home.png'

export const FooterSection = () => {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer
      id="footer"
      className="py-12 md:py-16 bg-lotus-deep text-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Column 1: Logo + Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoUrl}
                alt="Hoa Sen Spa Logo"
                loading="lazy"
                width={40}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert opacity-80"
              />
              <span className="font-display font-semibold text-lg tracking-wide text-white">
                HOA SEN SPA
              </span>
            </div>
            <p className="font-sans text-sm text-white/60 leading-relaxed max-w-xs">
              Không gian chăm sóc sức khỏe và sắc đẹp, nơi cơ thể tìm về sự tĩnh lặng.
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white mb-4 uppercase tracking-wider">
              Liên kết
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Giới thiệu', href: '#about' },
                { label: 'Dịch vụ', href: '#services' },
                { label: 'Không gian', href: '#space' },
                { label: 'Đánh giá', href: '#testimonials' },
                { label: 'Đặt lịch', href: '#booking' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-white/60 hover:text-lotus-gold transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white mb-4 uppercase tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-lotus-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="font-sans text-sm text-white/60">
                  123 Đường Lê Lợi, TP. Cao Lãnh, Đồng Tháp
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-lotus-gold shrink-0" strokeWidth={1.5} />
                <a
                  href="tel:09079593951"
                  className="font-sans text-sm text-white/60 hover:text-lotus-gold transition-colors duration-300"
                >
                  0907 95 93 95
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-lotus-gold shrink-0" strokeWidth={1.5} />
                <span className="font-sans text-sm text-white/60">
                  8:00 – 21:00, Thứ 2 – Chủ nhật
                </span>
              </li>
            </ul>

            {/* Social Icons with Accessible Touch Targets (w-11 h-11) */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="Facebook"
                className="w-11 h-11 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-lotus-gold hover:border-lotus-gold/40 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-11 h-11 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-lotus-gold hover:border-lotus-gold/40 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white mb-4 uppercase tracking-wider">
              Nhận ưu đãi
            </h4>
            <p className="font-sans text-sm text-white/60 mb-4 leading-relaxed">
              Đăng ký để nhận thông tin ưu đãi và khuyến mãi mới nhất.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-lotus-gold">
                <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-sans text-sm">Đã đăng ký thành công!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="flex-1 h-11 px-4 rounded-lg bg-white/10 border border-white/20 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-lotus-rose/30 focus:border-lotus-rose/40 transition-all"
                />
                <button
                  type="submit"
                  className="w-11 h-11 rounded-lg bg-lotus-rose flex items-center justify-center text-white hover:bg-lotus-rose/80 transition-colors shrink-0"
                  aria-label="Đăng ký nhận ưu đãi"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="font-sans text-xs text-white/40">
            © {currentYear} Hoa Sen Spa. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}
