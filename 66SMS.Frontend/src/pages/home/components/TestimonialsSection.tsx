import React from 'react';
import { motion } from 'motion/react';
import spaFacial  from '@/assets/spa_facial.png';
import spaMassage from '@/assets/spa_massage.png';
import spaProducts from '@/assets/spa_products.png';

const TESTIMONIALS = [
  {
    content: 'Hoa Sen Spa mang lại trải nghiệm hoàn toàn khác biệt. Không gian tinh khiết, nhân viên tay nghề cao và mùi hương sen làm tôi cực kỳ thư giãn.',
    name: 'Nguyễn Thị Hương',
    role: 'Giám đốc Kinh doanh',
    avatar: spaFacial,
    rating: 5,
  },
  {
    content: 'Từ ngày sử dụng gói Massage đá muối tại đây, sức khỏe cải thiện rõ rệt. Đội ngũ kỹ thuật viên rất chuyên nghiệp và tận tâm.',
    name: 'Trần Minh Châu',
    role: 'Giáo viên',
    avatar: spaMassage,
    rating: 5,
  },
  {
    content: 'Dịch vụ chăm sóc khách hàng tuyệt vời. Bộ sản phẩm tinh dầu sen về dùng thử và thực sự mê mẩn mùi hương tự nhiên.',
    name: 'Phạm Lê Bảo',
    role: 'Nhân viên Ngân hàng',
    avatar: spaProducts,
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-white lotus-bg-pattern border-t border-lotus-muted/15">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-lotus-foreground leading-tight mb-3">
            Khách Hàng <span className="text-lotus-primary italic font-medium">Nói Gì</span>
          </h2>
          <p className="font-sans text-lotus-foreground/55 text-sm max-w-md mx-auto">
            Hơn 50.000 lượt khách tin tưởng trải nghiệm. Đây là những chia sẻ chân thật nhất.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="bg-lotus-background rounded-3xl p-7 border border-lotus-muted/20 hover:border-lotus-primary/20 hover:shadow-jade transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 fill-lotus-highlight text-lotus-highlight" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="font-sans text-lotus-foreground/75 text-sm leading-relaxed flex-1">
                "{t.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-lotus-muted/20">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-lotus-primary/15"
                />
                <div>
                  <p className="font-display font-semibold text-lotus-foreground text-sm">{t.name}</p>
                  <p className="font-sans text-[11px] text-lotus-foreground/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
