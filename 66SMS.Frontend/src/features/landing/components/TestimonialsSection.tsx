import { useAutoRotate } from '../hooks/useAutoRotate'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Quote } from 'lucide-react'
import spaAbout from '@/assets/spa_about.png'
import spaMassage from '@/assets/spa_massage.png'
import spaFacial from '@/assets/spa_facial.png'

const TESTIMONIALS = [
  {
    name: 'Chị Minh Tâm',
    role: 'Khách hàng thân thiết',
    text: 'Mỗi lần đến Hoa Sen Spa, tôi cảm nhận được sự chăm sóc tận tâm từ từng chi tiết nhỏ. Không gian yên tĩnh, nhân viên chu đáo — đó là lý do tôi quay lại suốt 3 năm qua.',
    rating: 5,
    image: spaAbout,
  },
  {
    name: 'Chị Thanh Hà',
    role: 'Khách hàng',
    text: 'Liệu trình massage ở đây thật sự giúp tôi giảm đau lưng rất nhiều. Kỹ thuật viên rất chuyên nghiệp và luôn lắng nghe yêu cầu của khách.',
    rating: 5,
    image: spaMassage,
  },
  {
    name: 'Chị Bích Ngọc',
    role: 'Khách hàng từ 2022',
    text: 'Tôi đã thử nhiều spa nhưng không nơi nào cho cảm giác thư giãn như Hoa Sen. Đặc biệt là liệu trình chăm sóc da mặt — da tôi cải thiện rõ rệt sau 3 buổi.',
    rating: 5,
    image: spaFacial,
  },
  {
    name: 'Chị Phương Trinh',
    role: 'Khách hàng VIP',
    text: 'Không gian cực kỳ sạch sẽ và thơm tho. Mỗi lần vào đây là tôi quên hết mệt mỏi. Đặc biệt liệu trình body treatment rất đáng trải nghiệm.',
    rating: 5,
    image: spaMassage,
  },
  {
    name: 'Chị Kim Anh',
    role: 'Khách hàng từ 2023',
    text: 'Lần đầu tiên tôi đến đây là vì bạn bè giới thiệu. Giờ thì tôi đã thành khách quen rồi. Dịch vụ chuyên nghiệp, giá cả hợp lý. Rất hài lòng!',
    rating: 5,
    image: spaFacial,
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
      className="py-16 md:py-24 bg-lotus-deep"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Large Customer Photo (Dynamic) */}
          <div className="hidden md:block md:col-span-5">
            <div className="relative w-full aspect-[3/4] max-h-[480px]">
              {/* Offset border frame */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[140px] border border-lotus-gold/20" />
              {/* Main arched image */}
              <div className="absolute inset-0 rounded-t-[140px] overflow-hidden border border-white/10 bg-lotus-deep">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current}
                    src={TESTIMONIALS[current].image}
                    alt={TESTIMONIALS[current].name}
                    loading="lazy"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Heading + Testimonial Card */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {/* Section Heading */}
            <motion.div
              className="mb-8 text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
                Đánh giá
              </span>
              <h2 className="font-display italic font-normal text-[clamp(2rem,3vw,2.8rem)] text-white leading-[1.15]">
                Khách hàng nói gì
              </h2>
            </motion.div>

            {/* Testimonial Card container */}
            <div
              onMouseEnter={pause}
              onMouseLeave={resume}
              className="w-full"
            >
              <div className="relative min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-transparent border-0 rounded-none shadow-none text-left p-0"
                  >
                    <Quote className="w-8 h-8 text-lotus-gold/20 mb-4" strokeWidth={1.5} />

                    <p className="font-sans italic text-[clamp(1.1rem,1.8vw,1.3rem)] text-white/90 leading-[1.6] mb-6">
                      "{TESTIMONIALS[current].text}"
                    </p>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: TESTIMONIALS[current].rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-current text-lotus-gold"
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div>
                      <span className="block font-display text-[1.125rem] font-medium text-white mb-1">
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
              <div className="flex items-center justify-start gap-2 mt-6">
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
      </div>
    </section>
  )
}
