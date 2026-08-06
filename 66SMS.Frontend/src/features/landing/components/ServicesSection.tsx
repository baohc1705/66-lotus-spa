import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "./SectionHeader";
import { useServices } from "@/features/services/hooks/useServices";
import { setPendingServiceId } from "@/features/booking/utils/pendingBookingService";
import type { ServiceListDto } from "@/features/services/types/service.types";

import aboutBgCrane from "@/assets/about_bg_crane.png";
import aboutBg from "@/assets/backgrounds/about.webp";
import { FallbackImage } from "@/shared/components/FallbackImage";

function formatPrice(price?: number) {
  return `${(price || 0).toLocaleString("vi-VN")}đ`;
}

function formatDuration(mins?: number) {
  if (!mins) return "";
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours > 0 && remainingMins > 0) return `${hours}h${remainingMins}'`;
  if (hours > 0) return `${hours}h`;
  return `${mins} phút`;
}

export const ServicesSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const { data, isLoading, isError } = useServices({
    pageIndex: 1,
    pageSize: 12,
  });
  const services = data?.data?.items ?? [];

  const handleBook = (service: ServiceListDto) => {
    if (!service.id) return;
    setPendingServiceId(service.id);
    navigate("/dat-lich");
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="landing-section relative overflow-hidden bg-page"
      aria-labelledby="services-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-page via-rose-50/40 to-gold-100/30" />

        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 opacity-[0.07]"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url(${aboutBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </motion.div>

        <motion.div
          style={{ y: bgY }}
          className="absolute bottom-0 left-0 h-[280px] w-[320px] opacity-[0.06] mix-blend-multiply md:h-[420px] md:w-[480px]"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url(${aboutBgCrane})`,
              backgroundSize: "contain",
              backgroundPosition: "left bottom",
              backgroundRepeat: "no-repeat",
            }}
          />
        </motion.div>

        <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-rose-400/[0.06] blur-3xl" />
        <div className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-gold-600/[0.06] blur-3xl" />
      </div>

      <div className="landing-container relative z-10">
        <SectionHeader
          title="Dịch vụ"
          titleId="services-heading"
          variant="lotus"
          description="Chăm sóc từ tâm – Nâng tầm trải nghiệm"
          className="mb-10"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[5/3] animate-pulse border border-card-border bg-warm-100"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="py-12 text-center font-geist text-sm text-warm-600">
            Không tải được danh sách dịch vụ. Vui lòng thử lại sau.
          </p>
        ) : services.length === 0 ? (
          <p className="py-12 text-center font-geist text-sm text-warm-600">
            Hiện chưa có dịch vụ nào.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
            {services.map((service: ServiceListDto, i: number) => (
              <motion.button
                key={service.id}
                type="button"
                onClick={() => handleBook(service)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="landing-focus-ring group relative aspect-[5/3] w-[85%] min-w-[85%] shrink-0 snap-start overflow-hidden border border-card-border text-left transition-all duration-300 hover:border-rose-200 sm:w-auto sm:min-w-0 sm:shrink-0"
              >
                <FallbackImage
                  kind="service"
                  src={service.imageUrl}
                  alt={service.name || "Dịch vụ"}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div
                  className="absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 z-10 border-t border-card-border bg-surface px-4 py-3 transition-all duration-300 group-hover:pointer-events-none group-hover:translate-y-full group-hover:opacity-0 group-focus-within:pointer-events-none group-focus-within:translate-y-full group-focus-within:opacity-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold leading-snug text-ink sm:text-lg">
                        {service.name}
                      </h3>
                      <p className="mt-0.5 font-geist text-sm font-medium text-rose-600">
                        {formatPrice(service.sellingPrice)}
                        {service.durationMins
                          ? ` · ${formatDuration(service.durationMins)}`
                          : ""}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-rose-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                  <h3 className="mb-2 font-display text-xl font-semibold leading-snug text-white">
                    {service.name}
                  </h3>
                  <p className="mb-1 font-geist text-sm text-white/90">
                    {formatPrice(service.sellingPrice)}
                    {service.durationMins
                      ? ` · ${formatDuration(service.durationMins)}`
                      : ""}
                  </p>
                  {service.categoryName ? (
                    <p className="mb-4 font-geist text-xs text-white/70">
                      {service.categoryName}
                    </p>
                  ) : (
                    <div className="mb-4" />
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 font-geist text-sm font-medium text-white transition-colors duration-300 group-hover:bg-rose-500">
                    Đặt lịch
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
