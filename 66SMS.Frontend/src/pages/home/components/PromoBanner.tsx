import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const PromoBanner = () => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-lotus-foreground px-8 py-10 lg:px-14 lg:py-12 crane-bg-mark"
      >
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-lotus-primary/40 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-lotus-secondary/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Text */}
          <div className="max-w-xl">
            <span className="inline-block bg-lotus-highlight/20 text-lotus-highlight font-sans text-[11px] font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              Ưu đãi mùa hè 2026
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[2.6rem] font-semibold text-white leading-tight mb-3">
              Giảm 20% Gói Chăm Sóc <br className="hidden md:block"/>
              Da Mặt Chuyên Sâu
            </h2>
            <p className="font-sans text-white/55 text-sm">
              Áp dụng khi đặt lịch online. Hạn sử dụng: 31/08/2026.
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <a
              href="#dat-lich"
              className="inline-flex items-center gap-2.5 bg-lotus-highlight hover:bg-white text-lotus-foreground font-sans font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-px active:translate-y-0 shadow-gold"
            >
              Nhận ưu đãi ngay
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
