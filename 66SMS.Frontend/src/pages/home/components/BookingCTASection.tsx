import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Phone } from 'lucide-react';

export const BookingCTASection = () => {
  return (
    <section id="dat-lich" className="py-24 px-4 sm:px-6 lg:px-10 lotus-bg-pattern bg-lotus-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] bg-white border border-lotus-primary/12 shadow-jade-lg text-center px-8 py-16 lg:py-20"
        >
          {/* Decoration blobs */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-lotus-surface blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-lotus-secondary/10 blur-[50px] pointer-events-none" />

          {/* Lotus icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-16 h-16 rounded-2xl bg-lotus-primary flex items-center justify-center shadow-jade">
              <svg viewBox="0 0 40 40" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="26" rx="5" ry="10" opacity="0.9" transform="rotate(0,20,26)"/>
                <ellipse cx="20" cy="26" rx="5" ry="10" opacity="0.9" transform="rotate(45,20,26)"/>
                <ellipse cx="20" cy="26" rx="5" ry="10" opacity="0.9" transform="rotate(90,20,26)"/>
                <ellipse cx="20" cy="26" rx="5" ry="10" opacity="0.9" transform="rotate(135,20,26)"/>
                <circle cx="20" cy="24" r="4" opacity="1"/>
                <rect x="19" y="14" width="2" height="10" rx="1" opacity="0.8"/>
              </svg>
            </div>
          </div>

          <div className="relative">
            <span className="inline-block font-sans text-[11px] tracking-[0.26em] uppercase text-lotus-primary font-medium mb-4">
              Sẵn sàng trải nghiệm
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-lotus-foreground leading-tight mb-5">
              Bắt Đầu Hành Trình <br />
              <span className="text-lotus-primary italic font-medium">Làm Đẹp</span> Của Bạn
            </h2>
            <p className="font-sans text-lotus-foreground/60 text-base max-w-md mx-auto mb-10 leading-relaxed">
              Đặt lịch trực tuyến dễ dàng và nhận xác nhận tức thì. Đội ngũ chúng tôi đã sẵn sàng đón tiếp bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#"
                id="cta-booking-btn"
                className="inline-flex items-center justify-center gap-2.5 bg-lotus-primary hover:bg-lotus-foreground text-white font-sans font-medium text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-jade hover:shadow-jade-lg hover:-translate-y-px active:translate-y-0"
              >
                <Calendar className="w-4 h-4" />
                Đặt Lịch Hẹn Trực Tuyến
              </a>
              <a
                href="tel:09079593951"
                id="cta-call-btn"
                className="inline-flex items-center justify-center gap-2.5 bg-white border-2 border-lotus-muted/40 hover:border-lotus-primary text-lotus-foreground hover:text-lotus-primary font-sans font-medium text-sm px-8 py-4 rounded-full transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Gọi Ngay: 0907 95 93 95
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
