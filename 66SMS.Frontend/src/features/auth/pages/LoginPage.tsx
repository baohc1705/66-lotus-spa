import loginBgUrl from "@/assets/backgrounds/login-bg.webp";
import logoHomeUrl from "@/assets/logo-home.png";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const LoginPage = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${loginBgUrl})`,
    }}
  >
    <div className="flex flex-col items-center select-none mb-6">
      <img
        src={logoHomeUrl}
        alt="Hoa Sen Spa Logo"
        className="h-16 w-auto object-contain mb-2"
      />
      <h2 className="font-display text-2xl font-semibold tracking-[0.1em] text-rose-400 uppercase">HOA SEN</h2>
      <span className="text-xs tracking-[0.3em] text-gold-600 uppercase mt-1">SPA & SALON</span>
    </div>

    <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 shadow-gold animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-ink font-sans">Đăng nhập</h3>
        <div className="w-12 h-[2px] bg-rose-400 mx-auto mt-2" />
      </div>

      <LoginForm />
    </div>
  </div>
);
