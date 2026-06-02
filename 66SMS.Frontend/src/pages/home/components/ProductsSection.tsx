import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import spaProducts from '@/assets/spa_products.png';

const PRODUCTS = [
  { image: spaProducts, name: 'Tinh Dầu Hoa Sen Hữu Cơ 30ml', category: 'Trị liệu',     price: '450.000đ', originalPrice: '550.000đ', rating: 5 },
  { image: spaProducts, name: 'Mặt Nạ Bùn Khoáng Thanh Lọc',  category: 'Chăm sóc da', price: '320.000đ', originalPrice: '420.000đ', rating: 5 },
  { image: spaProducts, name: 'Muối Tắm Tẩy Tế Bào Chết',       category: 'Làm sạch',   price: '280.000đ', originalPrice: '350.000đ', rating: 4 },
  { image: spaProducts, name: 'Bộ Quà Tặng Nhan Sắc (4 Món)',   category: 'Combo',       price: '990.000đ', originalPrice: undefined,   rating: 5 },
];

export const ProductsSection = () => {
  return (
    <section id="san-pham" className="py-24 crane-bg-mark bg-lotus-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-[1px] bg-lotus-primary/40" />
              <span className="font-sans text-[11px] tracking-[0.26em] uppercase text-lotus-primary font-medium">Sản Phẩm</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-lotus-foreground leading-tight">
              Mang Spa <span className="text-lotus-primary italic font-medium">Về Nhà</span>
            </h2>
          </motion.div>

          <a
            href="#"
            className="font-sans text-sm font-medium text-lotus-primary hover:text-lotus-foreground flex items-center gap-1.5 transition-colors shrink-0"
          >
            Xem toàn bộ sản phẩm
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white rounded-2xl overflow-hidden border border-lotus-muted/20 hover:border-lotus-primary/25 hover:shadow-jade transition-all duration-400 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-lotus-surface">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-lotus-primary font-medium mb-1.5">
                  {p.category}
                </span>
                <h4 className="font-display text-sm font-semibold text-lotus-foreground leading-snug mb-2 flex-1">
                  {p.name}
                </h4>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3 h-3 ${j < p.rating ? 'fill-lotus-highlight text-lotus-highlight' : 'text-lotus-muted/40'}`}
                    />
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <span className="font-sans font-bold text-base text-lotus-primary">{p.price}</span>
                  {p.originalPrice && (
                    <span className="font-sans text-xs text-lotus-foreground/40 line-through mb-0.5">{p.originalPrice}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
