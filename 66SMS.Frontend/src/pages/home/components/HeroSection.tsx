import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import spaHero1 from '@/assets/spa_hero_1780310740369.png';
import spaHero2 from '@/assets/spa_facial_1780310754030.png';
import spaHero3 from '@/assets/spa_massage_1780310777520.png';
import spaHero4 from '@/assets/spa_treatment_1780310830592.png';

const slides = [
  {
    image: spaHero1,
    title: "Sen Spa",
    subtitle: "Không gian sang trọng, hòa lẫn giữa hiện đại và cổ điển",
    ctaText: "Khám phá",
    ctaLink: "#dich-vu",
  },
  {
    image: spaHero2,
    title: "Trị Liệu Mặt",
    subtitle: "Liệu trình chăm sóc da chuyên sâu với dưỡng chất hoa sen tự nhiên",
    ctaText: "Khám phá",
    ctaLink: "#dich-vu",
  },
  {
    image: spaHero3,
    title: "Massage Trị Liệu",
    subtitle: "Xua tan mệt mỏi, tái tạo năng lượng cơ thể bằng thảo dược cổ truyền",
    ctaText: "Khám phá",
    ctaLink: "#dat-lich",
  },
  {
    image: spaHero4,
    title: "Liệu Trình Sen",
    subtitle: "Phương pháp phục hồi sức khỏe đặc trưng từ vùng đất Sen Hồng",
    ctaText: "Khám phá",
    ctaLink: "#ve-chung-toi",
  }
];

export const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  // Auto-play slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      id="hero"
      className="group relative min-h-[100dvh] w-full flex items-end overflow-hidden bg-lotus-foreground select-none"
    >
      {/* Background Images with Fade Transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── HIGH-END Vignette & Shadows (Bóng đen bùn sen nhạt dịu) ── */}
      {/* Top to Bottom Mud Gradient for Navbar Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E1718]/80 via-[#1E1718]/20 to-transparent z-[2] pointer-events-none" />

      {/* Bottom to Top Mud Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1718]/50 via-[#1E1718]/30 to-transparent z-[2] pointer-events-none" />
      
      {/* Left to Right Side Mud Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E1718]/60 via-[#1E1718]/15 to-transparent z-[2] pointer-events-none" />

      {/* Radial Ambient Vignette with Lotus Mud Black */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(30,23,24,0.4)_100%)] z-[2] pointer-events-none" />

      {/* Manual Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-lotus-primary text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 border border-white/10 hover:scale-105 active:scale-95"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-lotus-primary text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 border border-white/10 hover:scale-105 active:scale-95"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28 pt-32">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4 overflow-hidden">
            <span className="w-8 h-[1px] bg-lotus-highlight/85" />
            <span className="font-sans text-[10px] tracking-[0.28em] uppercase text-lotus-highlight/90 font-medium">
              Hoa Sen Spa · Đồng Tháp
            </span>
          </div>

          {/* Animated Slide Content (Title & Subtitle) */}
          <div className="h-44 md:h-48 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Headline */}
                <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold text-white leading-[1.08] tracking-tight mb-4">
                  {slides[currentIndex].title}
                </h1>

                {/* Subtext */}
                <p className="font-sans text-white/80 text-base md:text-lg leading-relaxed max-w-lg mb-8">
                  {slides[currentIndex].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA Button: REVEAL ON HOVER (Premium Micro-animation) */}
          <div className="h-14 overflow-visible">
            <div className="transition-all duration-500 ease-out opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
              <a
                href={slides[currentIndex].ctaLink}
                id="hero-cta-explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-lotus-primary hover:bg-white hover:text-lotus-primary text-white font-sans font-medium text-sm rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
              >
                <span>{slides[currentIndex].ctaText}</span>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-12 z-20 flex flex-col items-center gap-1.5 text-white/35 font-sans">
        <span className="text-[8px] tracking-[0.25em] uppercase [writing-mode:vertical-lr] select-none">Cuộn xuống</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-1"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </div>
    </section>
  );
};
