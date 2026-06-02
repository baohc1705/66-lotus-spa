import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import spaFacial   from '@/assets/spa_facial.png';
import spaMassage  from '@/assets/spa_massage.png';
import spaTreatment from '@/assets/spa_treatment_1780310830592.png';
import spaHero     from '@/assets/spa_hero.png';

const SERVICES = [
  {
    image: spaFacial,
    badge: 'Phổ biến',
    title: 'Chăm Sóc Da Mặt Chuyên Sâu',
    description: 'Phục hồi làn da tươi trẻ với tinh chất hoa sen thiên nhiên Đồng Tháp.',
    price: '350.000đ',
    tag: 'Facial',
  },
  {
    image: spaMassage,
    badge: 'Mới',
    title: 'Massage Đá Muối Himalaya',
    description: 'Xoa tan mệt mỏi, khai thông khí huyết với đá muối khoáng kết hợp sen.',
    price: '450.000đ',
    tag: 'Massage',
  },
  {
    image: spaTreatment,
    badge: undefined,
    title: 'Thanh Lọc Toàn Thân',
    description: 'Liệu trình tẩy tế bào chết và ủ bùn khoáng nguyên chất Đồng Tháp.',
    price: '650.000đ',
    tag: 'Body',
  },
  {
    image: spaHero,
    badge: 'Hot',
    title: 'Ngâm Chân Thảo Dược',
    description: 'Thư giãn đôi chân với thảo mộc thiên nhiên, giúp ngủ ngon sâu giấc.',
    price: '250.000đ',
    tag: 'Foot',
  },
];

export const ServicesSection = () => {
  return (
    <section id="dich-vu" className="py-24 lotus-bg-pattern bg-lotus-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-lotus-foreground leading-tight mb-4">
            Liệu Trình <span className="text-lotus-primary italic font-medium">Đặc Trưng</span>
          </h2>
          <p className="font-sans text-lotus-foreground/60 text-base max-w-xl mx-auto leading-relaxed">
            Mỗi liệu trình được nghiên cứu từ bài thuốc dân gian Đồng Tháp, kết hợp kỹ thuật trị liệu hiện đại chuẩn quốc tế.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white rounded-2xl overflow-hidden border border-lotus-muted/20 hover:border-lotus-primary/25 hover:shadow-jade transition-all duration-500 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Tag */}
                <span className="absolute top-3 right-3 bg-lotus-foreground/80 backdrop-blur-sm text-white font-sans text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
                  {s.tag}
                </span>
                {/* Badge */}
                {s.badge && (
                  <span className="absolute top-3 left-3 bg-lotus-primary text-white font-sans text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full">
                    {s.badge}
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-lotus-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-semibold text-lotus-foreground group-hover:text-lotus-primary transition-colors duration-300 mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="font-sans text-[13px] text-lotus-foreground/60 leading-relaxed mb-4 flex-1">
                  {s.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-lotus-muted/20">
                  <div>
                    <span className="font-sans text-[10px] text-lotus-foreground/40">Từ </span>
                    <span className="font-sans font-bold text-lotus-primary text-sm">{s.price}</span>
                  </div>
                  <button className="text-[12px] font-semibold text-lotus-primary hover:text-lotus-foreground flex items-center gap-1 transition-colors">
                    Tư vấn
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#dat-lich"
            className="inline-flex items-center gap-2 border-2 border-lotus-primary text-lotus-primary hover:bg-lotus-primary hover:text-white font-sans font-medium text-sm px-8 py-3.5 rounded-full transition-all duration-300"
          >
            Xem tất cả dịch vụ
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
