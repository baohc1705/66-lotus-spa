import {
  Calendar,
  Clock,
  Heart,
  Users,
} from "lucide-react";
import { Logo } from "@/shared/components/Logo";
import { LoginForm } from "@/features/auth/components/LoginForm";

const features = [
  {
    icon: Calendar,
    title: "Đặt Lịch Trực Tuyến",
    desc: "Khách hàng tự chọn dịch vụ, kỹ thuật viên & thời gian mong muốn.",
  },
  {
    icon: Clock,
    title: "Tiết Kiệm Thời Gian",
    desc: "Hệ thống tự động điều phối giường, phòng và kỹ thuật viên.",
  },
  {
    icon: Heart,
    title: "Chăm Sóc Tận Tâm",
    desc: "Lưu trữ hồ sơ liệu trình sức khỏe, sở thích và ghi chú dịch vụ.",
  },
  {
    icon: Users,
    title: "Quản Lý Nhân Sự",
    desc: "Xếp lịch làm việc, tính lương và hoa hồng chuyên nghiệp.",
  },
];

const stats = [
  { value: "500+", label: "Lượt khách/ngày" },
  { value: "20+", label: "Liệu trình làm đẹp" },
  { value: "98%", label: "Hài lòng" },
];

export const LoginPage = () => (
  <div className="min-h-screen flex">
    <div
      className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1c0a1a 0%, #3e1b38 50%, #E91E8C 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #E8D5B0, transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #C9A86C, transparent)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <pattern
              id="login-dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
      </div>

      <div className="relative z-10">
        <Logo
          size="md"
          variant="light"
          showTagline
          taglineText="Beauty & Wellness"
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <h1
          className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 font-serif"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Trải nghiệm{" "}
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(90deg, #E8D5B0, #F06DAA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            vận hành hoàn hảo
          </span>
        </h1>
        <p className="text-pink-100 text-base leading-relaxed mb-10 max-w-md">
          Hệ thống chuyên nghiệp dành riêng cho Lotus Spa — hỗ trợ đặt lịch
          trực tuyến, chăm sóc liệu trình khách hàng và quản lý cơ sở tối ưu.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-4 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "rgba(233, 30, 140, 0.15)" }}
              >
                <Icon className="w-4 h-4 text-pink-300" />
              </div>
              <p className="text-white text-sm font-semibold mb-1">{title}</p>
              <p className="text-pink-200 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex gap-8">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-pink-200 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-[var(--spa-page-bg)]">
      <div className="lg:hidden mb-8">
        <Logo size="sm" variant="rose" showTagline taglineText="Lotus Spa" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2
            className="text-3xl font-bold text-[var(--spa-ui-text)] mb-2 font-serif"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Chào mừng trở lại
          </h2>
          <p className="text-[var(--spa-ui-text-muted)] text-sm">
            Đăng nhập tài khoản hệ thống Lotus Spa
          </p>
        </div>

        <LoginForm />
      </div>

      <div className="mt-12 text-center text-xs text-[var(--spa-ui-text-muted)]">
        <p>© 2026 Lotus Spa. Bảo lưu mọi quyền.</p>
      </div>
    </div>
  </div>
);
