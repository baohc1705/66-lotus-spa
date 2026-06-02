import { useAutoRotate } from '../hooks/useAutoRotate'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Chị Minh Tâm',
    role: 'Khách hàng thân thiết',
    text: 'Mỗi lần đến Hoa Sen Spa, tôi cảm nhận được sự chăm sóc tận tâm từ từng chi tiết nhỏ. Không gian yên tĩnh, nhân viên chu đáo — đó là lý do tôi quay lại suốt 3 năm qua.',
    rating: 5,
  },
  {
    name: 'Chị Thanh Hà',
    role: 'Khách hàng',
    text: 'Liệu trình massage ở đây thật sự giúp tôi giảm đau lưng rất nhiều. Kỹ thuật viên rất chuyên nghiệp và luôn lắng nghe yêu cầu của khách.',
    rating: 5,
  },
  {
    name: 'Chị Bích Ngọc',
    role: 'Khách hàng từ 2022',
    text: 'Tôi đã thử nhiều spa nhưng không nơi nào cho cảm giác thư giãn như Hoa Sen. Đặc biệt là liệu trình chăm sóc da mặt — da tôi cải thiện rõ rệt sau 3 buổi.',
    rating: 5,
  },
  {
    name: 'Chị Phương Trinh',
    role: 'Khách hàng VIP',
    text: 'Không gian cực kỳ sạch sẽ và thơm tho. Mỗi lần vào đây là tôi quên hết mệt mỏi. Đặc biệt liệu trình body treatment rất đáng trải nghiệm.',
    rating: 5,
  },
  {
    name: 'Chị Kim Anh',
    role: 'Khách hàng từ 2023',
    text: 'Lần đầu tiên tôi đến đây là vì bạn bè giới thiệu. Giờ thì tôi đã thành khách quen rồi. Dịch vụ chuyên nghiệp, giá cả hợp lý. Rất hài lòng!',
    rating: 5,
  },
]

export const TestimonialsSection = () => {
  const {
    current,
    setCurrent,
    pause,
    resume,
  } = useAutoRotate(TESTIMONIALS.length, 5000)

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-lotus-deep"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            Đánh giá
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-white">
            Khách hàng nói gì
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Testimonial Card */}
          <div
            onMouseEnter={pause}
            onMouseLeave={resume}
          >
            <div className="relative min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10"
                >
                  <Quote className="w-8 h-8 text-lotus-gold/40 mb-4" />

                  <p className="font-sans text-base md:text-lg text-white/90 leading-relaxed mb-6">
                    "{TESTIMONIALS[current].text}"
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: TESTIMONIALS[current].rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-current text-lotus-gold"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div>
                    <span className="block font-sans text-sm font-semibold text-white">
                      {TESTIMONIALS[current].name}
                    </span>
                    <span className="font-sans text-xs text-white/50">
                      {TESTIMONIALS[current].role}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-8 bg-lotus-gold'
                      : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Xem đánh giá ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
