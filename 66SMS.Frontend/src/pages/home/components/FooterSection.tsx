import React from 'react';
import { Phone, MapPin, Mail,  } from 'lucide-react';
import logoUrl from '@/assets/logo-home.png';

const FOOTER_LINKS = {
  'Dịch Vụ': ['Chăm sóc da mặt', 'Massage trị liệu', 'Thanh lọc toàn thân', 'Ngâm chân thảo dược'],
  'Công Ty': ['Giới thiệu', 'Tin tức', 'Tuyển dụng', 'Chính sách bảo mật'],
  'Hỗ Trợ': ['Đặt lịch online', 'Hỏi & Đáp', 'Chăm sóc khách hàng', 'Phản hồi'],
};

export const FooterSection = () => {
  return (
    <footer id="lien-he" className="bg-lotus-foreground text-white">
      {/* Top border accent */}
      <div className="h-[3px] bg-gradient-to-r from-lotus-primary via-lotus-secondary to-lotus-accent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5 select-none group">
              <img
                src={logoUrl}
                alt="Hoa Sen Spa Logo"
                className="h-12 w-auto object-contain shrink-0 filter drop-shadow-sm brightness-0 invert opacity-90 transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="flex flex-col leading-none justify-center">
                <p className="font-display font-semibold text-xl tracking-wide text-white">HOA SEN SPA</p>
                <p className="font-sans text-[9px] tracking-[0.26em] uppercase text-lotus-muted mt-0.5">Đồng Tháp</p>
              </div>
            </div>

            <p className="font-sans text-sm text-white/55 leading-relaxed mb-7 max-w-xs">
              Trải nghiệm spa đẳng cấp lấy cảm hứng từ vẻ đẹp thuần khiết của hoa sen Đồng Tháp. Nơi bình yên giữa lòng thiên nhiên.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-7">
              <a href="tel:09079593951" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm font-sans group">
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-lotus-primary/20 flex items-center justify-center transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                0907 95 93 95
              </a>
              <div className="flex items-start gap-3 text-white/60 text-sm font-sans">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>123 Nguyễn Huệ, Tp. Cao Lãnh, Đồng Tháp</span>
              </div>
              <a href="mailto:info@hoasenspa.vn" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm font-sans group">
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-lotus-primary/20 flex items-center justify-center transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                info@hoasenspa.vn
              </a>
            </div>

            {/* Social 
            <div className="flex gap-2">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'Youtube' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-lotus-primary flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>*/}
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-display font-semibold text-sm text-white mb-5 tracking-wide">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-sans text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs text-white/35">
            © 2026 Hoa Sen Spa · Đồng Tháp. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-5">
            {['Điều khoản', 'Bảo mật'].map((t) => (
              <a key={t} href="#" className="font-sans text-xs text-white/35 hover:text-white/70 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
