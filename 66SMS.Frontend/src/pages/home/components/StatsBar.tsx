import React from 'react';
import { motion } from 'motion/react';

const STATS = [
  { value: '15+',  label: 'Năm kinh nghiệm',      unit: '' },
  { value: '50K',  label: 'Khách hàng hài lòng',   unit: '+' },
  { value: '100%', label: 'Nguyên liệu tự nhiên',  unit: '' },
  { value: '20+',  label: 'Chi nhánh toàn quốc',   unit: '' },
];

export const StatsBar = () => {
  return (
    <section className="relative z-20 py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl shadow-jade border border-lotus-primary/8 overflow-hidden"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-lotus-muted/20">
          {STATS.map(({ value, label, unit }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center px-6 py-8 md:py-10 hover:bg-lotus-surface/40 transition-colors group"
            >
              <p className="font-display text-3xl md:text-4xl font-semibold text-lotus-primary mb-1.5 group-hover:scale-105 transition-transform duration-300">
                {value}
                <span className="text-lotus-secondary">{unit}</span>
              </p>
              <p className="font-sans text-xs text-lotus-foreground/55 tracking-wide">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
