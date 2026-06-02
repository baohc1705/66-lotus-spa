import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/shared/components/Logo";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-1 3h-2v6.8c4.56-.93 8-4.96 8-9.8z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const services = [
  "Chăm sóc da mặt",
  "Massage thư giãn",
  "Trị liệu cơ thể",
  "Làm móng cao cấp",
  "Chăm sóc tóc",
  "Xông hơi sauna",
];

const quickLinks = ["Về chúng tôi", "Bảng giá", "Đặt lịch hẹn", "Blog làm đẹp", "Tuyển dụng", "Liên hệ"];

export function SpaFooter() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #2D1B2E 0%, #1a0d1b 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <Logo variant="light" showTagline size="md" className="mb-4" />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Nơi bạn được trải nghiệm dịch vụ chăm sóc sắc đẹp đẳng cấp, mang lại vẻ đẹp tự nhiên và sự tự tin hoàn hảo.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: YoutubeIcon, label: "Youtube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--spa-rose)] transition-colors duration-200 text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Dịch vụ</h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#dich-vu"
                    className="text-white/60 hover:text-[var(--spa-rose-light)] text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--spa-rose)] opacity-60" />
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Liên kết</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[var(--spa-rose-light)] text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--spa-rose)] opacity-60" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Liên hệ</h4>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: "Tân Hộ Cơ, Đồng Tháp" },
                { icon: Phone, text: "1900 7777" },
                { icon: Mail, text: "hello@66spa.vn" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-white/60">
                  <Icon className="w-4 h-4 text-[var(--spa-rose-light)] mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Giờ mở cửa</p>
              <p className="text-white text-sm font-medium">T2 – T7: 8:00 – 20:00</p>
              <p className="text-white text-sm font-medium">CN: 9:00 – 18:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">© 2026 Lotus Spa. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            {["Điều khoản", "Bảo mật", "Cookie"].map((l) => (
              <a key={l} href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
