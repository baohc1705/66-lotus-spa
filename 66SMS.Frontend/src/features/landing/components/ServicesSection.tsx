import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkle } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { SERVICE_CATEGORY_ROUTES } from "../constants/serviceCategory.routes";

import aboutBg from "@/assets/backgrounds/about.webp";
import aboutBgCrane from "@/assets/about_bg_crane.png";

import iconTowel from "@/assets/icons/towel.webp";
import iconFaceMask from "@/assets/icons/face-mask.webp";
import iconHandCream from "@/assets/icons/hand-cream.webp";
import iconLotus from "@/assets/icons/lotus.webp";

import spaMassage from "@/assets/spa_massage.png";
import spaFacial from "@/assets/spa_facial.png";
import spaTreatment from "@/assets/spa_treatment_1780310830592.png";
import spaAbout from "@/assets/spa_about.png";

const SERVICE_CATEGORIES = [
  {
    title: "Chăm sóc toàn thân",
    description:
      "Body scrub, tắm thảo dược, trị liệu thư giãn toàn thân. Mang lại cảm giác thư thái, giúp cơ thể phục hồi và tái tạo năng lượng.",
    imageSrc: spaMassage,
    imageAlt: "Danh mục chăm sóc toàn thân",
    iconSrc: iconTowel,
    href: SERVICE_CATEGORY_ROUTES.body,
  },
  {
    title: "Chăm sóc da mặt",
    description:
      "Facial sen, dưỡng ẩm sâu và phục hồi làn da nhạy cảm. Giúp da sáng khỏe, mềm mịn và cân bằng tự nhiên.",
    imageSrc: spaFacial,
    imageAlt: "Danh mục chăm sóc da mặt",
    iconSrc: iconFaceMask,
    href: SERVICE_CATEGORY_ROUTES.facial,
  },
  {
    title: "Massage & thư giãn",
    description:
      "Massage trị liệu, ấn huyệt và thư giãn tay chân. Giải tỏa căng thẳng, hỗ trợ tuần hoàn và mang lại sự dễ chịu sâu.",
    imageSrc: spaTreatment,
    imageAlt: "Danh mục massage và thư giãn",
    iconSrc: iconHandCream,
    href: SERVICE_CATEGORY_ROUTES.relax,
  },
  {
    title: "Gói dịch vụ",
    description:
      "Combo tiết kiệm và gói VIP dành cho khách thân thiết. Trải nghiệm đầy đủ liệu trình với ưu đãi trọn gói.",
    imageSrc: spaAbout,
    imageAlt: "Danh mục gói dịch vụ",
    iconSrc: iconLotus,
    href: SERVICE_CATEGORY_ROUTES.package,
  },
];

export const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="landing-section relative overflow-hidden"
      style={{ backgroundColor: "#FFF9F5" }}
      aria-labelledby="services-heading"
    >
      {/* Background di chuyển */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #FFFDF9 0%, #FFF7F4 42%, #FCEFEF 100%)",
          }}
        />

        <motion.div style={{ y: bgY }} className="absolute inset-0 opacity-[0.09]">
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
          className="absolute bottom-0 left-0 h-[280px] w-[320px] opacity-[0.07] mix-blend-multiply md:h-[420px] md:w-[480px]"
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

        <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[#C85A7B]/[0.05] blur-3xl" />
        <div className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-[#D7A76D]/[0.07] blur-3xl" />
        <div className="absolute right-[18%] top-0 h-40 w-40 rounded-full bg-[#FCEFEF]/80 blur-2xl" />
      </div>

      <div className="landing-container relative z-10">
        <SectionHeader
          title="Dịch vụ"
          titleId="services-heading"
          variant="lotus"
          description="Chăm sóc từ tâm – Nâng tầm trải nghiệm"
          className="mb-10"
        />

        {/* Mobile: scroll ngang · sm+: lưới 2 cột */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0">
          {SERVICE_CATEGORIES.map((category, i) => (
            <motion.a
              key={category.title}
              href={category.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="landing-focus-ring group relative aspect-[5/3] w-[85%] min-w-[85%] shrink-0 snap-start overflow-hidden shadow-[0_4px_18px_rgba(42,31,26,0.07)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(42,31,26,0.14)] sm:w-auto sm:min-w-0 sm:shrink-0"
            >
              <img
                src={category.imageSrc}
                alt={category.imageAlt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div
                className="absolute inset-0 bg-[rgba(42,31,26,0.58)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                aria-hidden="true"
              />

              <div className="absolute inset-x-0 bottom-0 z-10 h-[22%] bg-[#FFF9F5] transition-all duration-300 group-hover:pointer-events-none group-hover:translate-y-full group-hover:opacity-0 group-focus-within:pointer-events-none group-focus-within:translate-y-full group-focus-within:opacity-0">
                <div className="absolute left-4 top-0 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-lotus-rose bg-white shadow-sm sm:left-5 sm:h-14 sm:w-14">
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 bg-lotus-rose sm:h-7 sm:w-7"
                    style={{
                      WebkitMaskImage: `url(${category.iconSrc})`,
                      maskImage: `url(${category.iconSrc})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                </div>

                <div className="flex h-full items-center justify-between gap-3 pl-[4.25rem] pr-4 sm:pl-[5rem] sm:pr-5">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold leading-snug text-lotus-deep sm:text-lg">
                      {category.title}
                    </h3>
                    <span
                      className="mt-1.5 block h-px w-10 bg-lotus-rose"
                      aria-hidden="true"
                    />
                  </div>

                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-lotus-rose"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-4 flex-col items-center px-5 pb-6 pt-8 text-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <h3 className="mb-2 flex items-center justify-center gap-2 font-display text-xl font-semibold leading-snug text-white sm:text-[1.35rem]">
                  <Sparkle
                    className="h-3.5 w-3.5 shrink-0 text-white"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  {category.title}
                  <Sparkle
                    className="h-3.5 w-3.5 shrink-0 text-white"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </h3>

                <p className="mb-4 max-w-[26rem] font-geist text-sm leading-[1.6] text-white/90">
                  {category.description}
                </p>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-lotus-rose px-5 py-2.5 font-geist text-sm font-medium text-white transition-colors duration-300 group-hover:bg-lotus-rose-dark">
                  Xem chi tiết
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
