import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import lotusIcon from "@/assets/icons/lotus.webp";

const REVIEWS = [
  {
    name: "Chị Minh Tâm",
    role: "Khách thân thiết · 3 năm",
    text: "Không gian yên tĩnh, nhân viên chu đáo — tôi quay lại suốt 3 năm qua vì cảm giác được chăm sóc thật sự.",
    rating: 5,
    initials: "MT",
  },
  {
    name: "Chị Thanh Hà",
    role: "Khách hàng",
    text: "Massage giúp giảm đau lưng rõ rệt. Kỹ thuật viên lắng nghe và rất nhẹ tay.",
    rating: 5,
    initials: "TH",
  },
  {
    name: "Chị Bích Ngọc",
    role: "Khách từ 2022",
    text: "Da tôi sáng mịn hơn sau 3 buổi facial. Mùi sen rất dễ chịu, không gian cũng rất sạch sẽ.",
    rating: 5,
    initials: "BN",
  },
  {
    name: "Chị Phương Trinh",
    role: "Khách VIP",
    text: "Phòng riêng sạch sẽ, thơm tho. Body treatment đáng trải nghiệm, sẽ giới thiệu bạn bè.",
    rating: 5,
    initials: "PT",
  },
];

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5" aria-label={`${count} sao`}>
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        className="h-3.5 w-3.5 fill-gold-600 text-gold-600"
        aria-hidden="true"
      />
    ))}
  </div>
);

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = REVIEWS.length;

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const orderedReviews = [
    ...REVIEWS.slice(activeIndex),
    ...REVIEWS.slice(0, activeIndex),
  ];

  return (
    <section
      id="testimonials"
      className="landing-section relative overflow-hidden bg-page"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 top-8 h-56 w-56 opacity-[0.06] sm:h-72 sm:w-72"
        aria-hidden="true"
        style={{
          backgroundColor: "var(--rose-600)",
          WebkitMaskImage: `url(${lotusIcon})`,
          maskImage: `url(${lotusIcon})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

      <div className="landing-container relative z-10">
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/10 px-3.5 py-1.5 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
            <span
              className="h-3.5 w-3.5 bg-rose-600"
              style={{
                WebkitMaskImage: `url(${lotusIcon})`,
                maskImage: `url(${lotusIcon})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              aria-hidden="true"
            />
            Feedback
          </span>
        </div>

        <SectionHeader
          title="Khách hàng nói gì"
          titleId="testimonials-heading"
          variant="lotus"
          description="Những trải nghiệm thực tế từ khách hàng đã sử dụng dịch vụ của chúng tôi."
          className="mb-10"
        />

        <div className="hidden gap-5 lg:grid lg:grid-cols-4">
          {REVIEWS.map((item, i) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`flex flex-col bg-white p-5 shadow-[0_8px_28px_rgba(212,84,126,0.08)] transition-shadow duration-300 ${
                i === activeIndex
                  ? "shadow-[0_10px_32px_rgba(212,84,126,0.16)]"
                  : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <Quote
                  className="h-7 w-7 text-rose-600/80"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <Stars count={item.rating} />
              </div>

              <p className="mb-5 flex-1 font-geist text-sm leading-[1.7] text-warm-600">
                {item.text}
              </p>

              <div
                className="mb-4 h-px w-full bg-rose-600/15"
                aria-hidden="true"
              />

              <footer className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600/15 font-geist text-xs font-semibold text-rose-600"
                  aria-hidden="true"
                >
                  {item.initials}
                </span>
                <cite className="not-italic">
                  <span className="block font-geist text-sm font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="font-geist text-xs text-warm-600">
                    {item.role}
                  </span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={orderedReviews[0].name}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28 }}
              className="flex flex-col bg-white p-5 shadow-[0_8px_28px_rgba(212,84,126,0.08)] sm:mx-auto sm:max-w-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <Quote
                  className="h-7 w-7 text-rose-600/80"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <Stars count={orderedReviews[0].rating} />
              </div>

              <p className="mb-5 flex-1 font-geist text-sm leading-[1.7] text-warm-600">
                {orderedReviews[0].text}
              </p>

              <div
                className="mb-4 h-px w-full bg-rose-600/15"
                aria-hidden="true"
              />

              <footer className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600/15 font-geist text-xs font-semibold text-rose-600"
                  aria-hidden="true"
                >
                  {orderedReviews[0].initials}
                </span>
                <cite className="not-italic">
                  <span className="block font-geist text-sm font-semibold text-ink">
                    {orderedReviews[0].name}
                  </span>
                  <span className="font-geist text-xs text-warm-600">
                    {orderedReviews[0].role}
                  </span>
                </cite>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Đánh giá trước"
            className="landing-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-rose-600/30 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Chọn đánh giá"
          >
            {REVIEWS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Đánh giá ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`landing-focus-ring h-2 w-2 rounded-full transition-colors ${
                  i === activeIndex ? "bg-rose-600" : "bg-rose-600/25"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Đánh giá tiếp"
            className="landing-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-rose-600/30 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
