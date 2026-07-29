import { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Send,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import logoUrl from "@/assets/logo-home.png";
import { usePrimarySalon } from "@/features/salons/hooks/usePrimarySalon";

const NAV_LINKS = [
  { label: "Giới thiệu", href: "#about" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Sản phẩm", href: "#products" },
  { label: "Phòng riêng", href: "#space" },
  { label: "Đánh giá", href: "#testimonials" },
  { label: "Câu hỏi", href: "#faq" },
  { label: "Đặt lịch", href: "/dat-lich" },
];

const FALLBACK = {
  name: "Hoa Sen Spa",
  address: "123 Đường Lê Lợi, TP. Cao Lãnh, Đồng Tháp",
  phone: "0907959395",
  phoneDisplay: "0907 95 93 95",
  hours: "8:00 – 21:00, Thứ 2 – Chủ nhật",
};

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

function resolveHours(workingDays?: string | null) {
  if (!workingDays) return FALLBACK.hours;
  if (/^\d+$/.test(workingDays.trim())) return FALLBACK.hours;
  return workingDays;
}

export const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const primaryQuery = usePrimarySalon();
  const salon = primaryQuery.data;

  const name = salon?.name || FALLBACK.name;
  const address =
    salon?.fullAddress || salon?.streetAddress || FALLBACK.address;
  const phone = salon?.phone || FALLBACK.phone;
  const phoneDisplay = salon?.phone
    ? formatPhoneDisplay(salon.phone)
    : FALLBACK.phoneDisplay;
  const hours = resolveHours(salon?.workingDays);

  const handleNewsletter = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer id="footer" className="bg-ink pb-8 pt-12 text-white">
      <div className="landing-container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="mb-5 flex items-center gap-3">
              <img
                src={logoUrl}
                alt={name}
                loading="lazy"
                width={40}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert opacity-85"
              />
              <span className="font-geist text-lg font-semibold tracking-[-0.01em]">
                {name}
              </span>
            </div>
            <p className="mb-8 max-w-sm font-geist text-sm leading-relaxed text-white/55">
              Không gian chăm sóc sức khỏe và sắc đẹp tại Cao Lãnh — nơi cơ thể
              tìm về sự tĩnh lặng.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-white/55">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone
                  className="h-4 w-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${phone}`}
                  className="landing-focus-ring text-white/55 transition-colors hover:text-gold-600"
                >
                  {phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/55">
                <Clock
                  className="h-4 w-4 shrink-0 text-gold-600"
                  aria-hidden="true"
                />
                <span>{hours}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-5 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
              Điều hướng
            </h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="landing-focus-ring inline-flex items-center gap-1 font-geist text-sm text-white/55 transition-colors hover:text-gold-600"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-5 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
              Nhận ưu đãi
            </h2>
            <p className="mb-4 font-geist text-sm leading-relaxed text-white/55">
              Đăng ký email để nhận thông tin khuyến mãi và liệu trình mới.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-gold-600">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                <span className="font-geist text-sm">
                  Đã đăng ký thành công
                </span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <label htmlFor="footer-email" className="sr-only">
                  Email của bạn
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="landing-focus-ring h-11 flex-1 border border-white/15 bg-white/8 px-4 font-geist text-sm text-white placeholder:text-white/35"
                />
                <button
                  type="submit"
                  className="landing-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white transition-colors hover:bg-rose-500"
                  aria-label="Đăng ký nhận ưu đãi"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Facebook ${name}`}
                className="landing-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-gold-600/40 hover:text-gold-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${name}`}
                className="landing-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-gold-600/40 hover:text-gold-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="font-geist text-xs text-white/40">
            © {currentYear} {name}. Mọi quyền được bảo lưu.
          </p>
          <div className="flex gap-5">
            <a
              href="/privacy"
              className="landing-focus-ring font-geist text-xs text-white/40 hover:text-white/70"
            >
              Chính sách bảo mật
            </a>
            <a
              href="/terms"
              className="landing-focus-ring font-geist text-xs text-white/40 hover:text-white/70"
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
