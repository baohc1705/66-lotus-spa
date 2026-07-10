import { motion } from "motion/react";
import { ArrowRight, Phone } from "lucide-react";
import spaFacial from "@/assets/spa_facial.png";

export const BookingCtaSection = () => {
  return (
    <section
      id="booking"
      className="landing-section bg-lotus-cream"
      aria-labelledby="booking-cta-heading"
    >
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative min-h-[360px] overflow-hidden shadow-[0_8px_32px_rgba(42,31,26,0.12)] lg:min-h-[400px]"
        >
          {/* Ảnh full background */}
          <img
            src={spaFacial}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay mờ dần: đậm bên trái (chữ) → trong suốt bên phải (ảnh) */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#2a1f1a] via-[#2a1f1a]/88 to-[#2a1f1a]/15 sm:via-[#2a1f1a]/75 sm:to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#2a1f1a]/50 via-transparent to-[#2a1f1a]/20 lg:hidden"
            aria-hidden="true"
          />

          {/* Content nổi trên nền */}
          <div className="relative z-10 flex min-h-[360px] items-center px-8 py-12 sm:px-10 sm:py-14 lg:min-h-[400px] lg:w-[58%] lg:px-12 xl:px-14">
            <div className="max-w-lg">
              <h2
                id="booking-cta-heading"
                className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.15] tracking-[0.01em] text-white"
              >
                Sẵn sàng bắt đầu
                <br />
                hành trình của bạn?
              </h2>

              <p className="mt-4 font-geist text-base leading-[1.65] text-white/80">
                Đặt lịch hôm nay và trải nghiệm sự kết hợp tinh tế giữa truyền thống
                Việt Nam và chăm sóc hiện đại tại Hoa Sen Spa.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/dat-lich"
                  className="landing-focus-ring inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-geist text-sm font-medium text-lotus-deep transition-colors duration-300 hover:bg-white/90"
                >
                  Xác nhận đặt lịch
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <a
                  href="tel:0907959395"
                  className="landing-focus-ring inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 font-geist text-sm font-medium text-white backdrop-blur-[2px] transition-colors duration-300 hover:border-white hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Liên hệ
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
