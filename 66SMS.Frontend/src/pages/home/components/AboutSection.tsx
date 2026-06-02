import React from 'react';
import { motion } from 'motion/react';
import { Award, Heart, Leaf, Shield } from 'lucide-react';
import spaAbout from '@/assets/spa_about.png';

const FEATURES = [
  { icon: Award, title: 'Chất lượng cao cấp',    desc: 'Kỹ thuật viên được đào tạo bài bản chuẩn quốc tế.' },
  { icon: Heart, title: 'Thành phần hữu cơ',     desc: '100% tinh chất hoa sen và thảo mộc lành tính.' },
  { icon: Leaf,  title: 'Không gian tĩnh lặng',  desc: 'Kiến trúc mang hơi thở bản địa Đồng Tháp.' },
  { icon: Shield,title: 'An toàn tuyệt đối',     desc: 'Cam kết tiêu chuẩn vệ sinh y tế cao nhất.' },
];

export const AboutSection = () => {
  return (
    <section id="ve-chung-toi" className="py-24 bg-white lotus-bg-pattern">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main image */}
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-jade-lg">
              <img
                src={spaAbout}
                alt="Không gian Hoa Sen Spa Đồng Tháp"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Accent card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-6 -right-4 lg:-right-8 bg-lotus-primary text-white rounded-2xl px-6 py-5 shadow-jade-lg"
            >
              <p className="font-sans text-[10px] text-white/70 uppercase tracking-widest mb-1">Khách quay lại</p>
              <p className="font-display text-4xl font-bold">98%</p>
            </motion.div>

            {/* Decorator ring */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border-2 border-lotus-primary/15 pointer-events-none" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Section label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-[1px] bg-lotus-primary/40" />
              <span className="font-sans text-[11px] tracking-[0.26em] uppercase text-lotus-primary font-medium">Về Chúng Tôi</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-semibold text-lotus-foreground leading-tight mb-5">
              Tinh Hoa <br/>
              <span className="text-lotus-primary italic font-medium">Đồng Tháp</span>
            </h2>

            <p className="font-sans text-lotus-foreground/65 text-base leading-relaxed mb-10">
              Hoa Sen Spa ra đời với sứ mệnh mang lại sự thư giãn nguyên sơ, kết hợp hoàn hảo giữa kỹ thuật trị liệu hiện đại và những bài thuốc dân gian từ hoa sen — biểu tượng của vùng đất Đồng Tháp thanh bình.
            </p>

            {/* Features 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                  className="flex gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-lotus-surface flex items-center justify-center shrink-0 group-hover:bg-lotus-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-lotus-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-lotus-foreground text-sm mb-0.5">{title}</p>
                    <p className="font-sans text-xs text-lotus-foreground/55 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
