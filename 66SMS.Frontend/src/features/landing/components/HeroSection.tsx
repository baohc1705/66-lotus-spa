import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import spaHero from "@/assets/spa_hero.png";
import spaMassage from "@/assets/spa_massage.png";
import spaFacial from "@/assets/spa_facial.png";

/* ── Lotus petal SVG — nhỏ, đơn sắc hồng sen ── */
const LotusPetal = ({ style }: { style: React.CSSProperties }) => (
  <div className="petal absolute" style={style}>
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <path
        d="M11 0C11 0 0 10 0 18C0 22.5 4.5 28 11 28C17.5 28 22 22.5 22 18C22 10 11 0 11 0Z"
        fill="var(--rose-400)"
        opacity="0.55"
      />
    </svg>
  </div>
);

/* ── Petal configs — 10 cánh rơi ── */
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + i * 9}%`,
  animationDuration: `${8 + Math.random() * 7}s`,
  animationDelay: `${Math.random() * 8}s`,
  fontSize: `${14 + Math.random() * 10}px`,
}));

/* ── Slides Data ── */
const SLIDES = [
  {
    id: "slide-1",
    image: spaHero,
    brand: "Hoa Sen Spa · Đồng Tháp",
    title: <>Tĩnh lặng</>,
    subtitle:
      "Không gian chăm sóc sức khỏe và sắc đẹp giữa lòng thành phố, nơi mỗi liệu trình là một hành trình phục hồi.",
    ctaPrimary: "Đặt lịch ngay",
    ctaPrimaryHref: "/dat-lich",
    ctaSecondary: "Khám phá",
    ctaSecondaryHref: "#about",
  },
  {
    id: "slide-2",
    image: spaMassage,
    brand: "Trị Liệu Chuyên Sâu",
    title: <>Phục hồi</>,
    subtitle:
      "Các liệu pháp massage ấn huyệt kết hợp thảo dược phương Đông giúp xua tan mệt mỏi, tái tạo sinh khí.",
    ctaPrimary: "Xem dịch vụ",
    ctaPrimaryHref: "#services",
    ctaSecondary: "Đặt lịch",
    ctaSecondaryHref: "/dat-lich",
  },
  {
    id: "slide-3",
    image: spaFacial,
    brand: "Chăm Sóc Làn Da",
    title: (
      <>
        Đánh thức
        <br />
        vẻ đẹp
      </>
    ),
    subtitle:
      "Phác đồ chăm sóc da chuẩn y khoa kết hợp mỹ phẩm hữu cơ, mang lại làn da tươi trẻ và khỏe mạnh tự nhiên.",
    ctaPrimary: "Khám phá facial",
    ctaPrimaryHref: "#services",
    ctaSecondary: "Đặt lịch",
    ctaSecondaryHref: "/dat-lich",
  },
];

/* ── Text Animation Variants ── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex items-end overflow-hidden bg-ink select-none"
    >
      {/* Background Slider — full-bleed */}
      <div className="absolute inset-0 w-full h-[120%] overflow-hidden will-change-transform">
        <motion.div style={{ y: bgY }} className="relative w-full h-full">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentIndex}
              src={SLIDES[currentIndex].image}
              alt={SLIDES[currentIndex].brand}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              fetchPriority={currentIndex === 0 ? "high" : "auto"}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="hero-overlay absolute inset-0 z-[2] pointer-events-none" />

      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {PETALS.map((p, i) => (
          <LotusPetal
            key={i}
            style={{
              left: p.left,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Navigation arrows — desktop only */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-between px-4 md:flex md:px-8">
        <button
          type="button"
          onClick={prevSlide}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/30 text-white/70 backdrop-blur-sm transition-all hover:bg-ink/50 hover:text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/30 text-white/70 backdrop-blur-sm transition-all hover:bg-ink/50 hover:text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Content — brand + headline + one sentence + CTAs */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pb-28 md:pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl"
          >
            <motion.p
              variants={textVariants}
              className="mb-2 font-display text-2xl font-semibold tracking-wide text-white md:mb-3 md:text-3xl"
            >
              Hoa Sen
            </motion.p>

            <motion.span
              variants={textVariants}
              className="mb-4 block font-sans text-xs font-medium uppercase tracking-[0.22em] text-gold-100 md:mb-5 md:text-sm"
            >
              {SLIDES[currentIndex].brand}
            </motion.span>

            <motion.h1
              variants={textVariants}
              className="mb-4 font-display text-display-hero font-normal text-white md:mb-6"
            >
              {SLIDES[currentIndex].title}
            </motion.h1>

            <motion.p
              variants={textVariants}
              className="mb-6 max-w-lg font-sans text-base leading-relaxed text-white/80 md:mb-8 md:text-lg"
            >
              {SLIDES[currentIndex].subtitle}
            </motion.p>

            <motion.div
              variants={textVariants}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <a
                href={SLIDES[currentIndex].ctaPrimaryHref}
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-rose-500 md:px-8 md:py-3.5 md:text-base"
              >
                {SLIDES[currentIndex].ctaPrimary}
              </a>
              <a
                href={SLIDES[currentIndex].ctaSecondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 font-sans text-sm font-medium text-white transition-all duration-300 hover:border-white hover:bg-white/10 md:px-8 md:py-3.5 md:text-base"
              >
                {SLIDES[currentIndex].ctaSecondary}
              </a>
            </motion.div>

            {/* Dots — mobile only */}
            <motion.div
              variants={textVariants}
              className="mt-8 flex items-center gap-2 md:hidden"
              role="tablist"
              aria-label="Chọn slide"
            >
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`landing-focus-ring h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 bg-rose-600"
                      : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
