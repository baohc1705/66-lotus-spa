import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import spaHero from '@/assets/spa_hero.png'
import spaMassage from '@/assets/spa_massage.png'
import spaFacial from '@/assets/spa_facial.png'

/* ── Lotus petal SVG — nhỏ, đơn sắc hồng sen ── */
const LotusPetal = ({ style }: { style: React.CSSProperties }) => (
  <div className="petal absolute" style={style}>
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <path
        d="M11 0C11 0 0 10 0 18C0 22.5 4.5 28 11 28C17.5 28 22 22.5 22 18C22 10 11 0 11 0Z"
        fill="var(--lotus-rose)"
        opacity="0.6"
      />
    </svg>
  </div>
)

/* ── Petal configs — 10 cánh rơi ── */
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: `${8 + i * 9}%`,
  animationDuration: `${8 + Math.random() * 7}s`,
  animationDelay: `${Math.random() * 8}s`,
  fontSize: `${14 + Math.random() * 10}px`,
}))

/* ── Slides Data ── */
const SLIDES = [
  {
    id: 'slide-1',
    image: spaHero,
    brand: 'Hoa Sen Spa · Đồng Tháp',
    title: (
      <>
        Nơi cơ thể<br />
        tìm về<br />
        sự tĩnh lặng
      </>
    ),
    subtitle: 'Không gian chăm sóc sức khỏe và sắc đẹp giữa lòng thành phố, nơi mỗi liệu trình là một hành trình phục hồi.',
    ctaPrimary: 'Đặt lịch ngay',
    ctaPrimaryHref: '#booking',
    ctaSecondary: 'Khám phá',
    ctaSecondaryHref: '#about'
  },
  {
    id: 'slide-2',
    image: spaMassage,
    brand: 'Trị Liệu Chuyên Sâu',
    title: (
      <>
        Phục hồi<br />
        năng lượng<br />
        từ bên trong
      </>
    ),
    subtitle: 'Các liệu pháp massage ấn huyệt kết hợp thảo dược phương Đông giúp xua tan mệt mỏi, tái tạo sinh khí.',
    ctaPrimary: 'Xem dịch vụ',
    ctaPrimaryHref: '#services',
    ctaSecondary: 'Tư vấn ngay',
    ctaSecondaryHref: '#contact'
  },
  {
    id: 'slide-3',
    image: spaFacial,
    brand: 'Chăm Sóc Làn Da',
    title: (
      <>
        Đánh thức<br />
        vẻ đẹp<br />
        rạng ngời
      </>
    ),
    subtitle: 'Phác đồ chăm sóc da chuẩn y khoa kết hợp mỹ phẩm hữu cơ, mang lại làn da tươi trẻ và khỏe mạnh tự nhiên.',
    ctaPrimary: 'Khám phá facial',
    ctaPrimaryHref: '#services',
    ctaSecondary: 'Nhận ưu đãi',
    ctaSecondaryHref: '#booking'
  }
]

/* ── Text Animation Variants ── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn"
    }
  }
}

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: background moves slower than scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex items-end overflow-hidden bg-lotus-deep select-none"
    >
      {/* Background Slider */}
      <div className="absolute inset-0 w-full h-[120%] overflow-hidden will-change-transform">
        <motion.div style={{ y: bgY }} className="relative w-full h-full">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentIndex}
              src={SLIDES[currentIndex].image}
              alt={SLIDES[currentIndex].brand}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              fetchPriority={currentIndex === 0 ? "high" : "auto"}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Overlay Gradient */}
      <div className="hero-overlay absolute inset-0 z-[2] pointer-events-none" />

      {/* Falling Lotus Petals */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        {PETALS.map((p, i) => (
          <LotusPetal
            key={i}
            style={{
              left: p.left,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Navigation Controls (Arrows) */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 md:px-8 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-[5%] pb-36 md:pb-40 pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl"
          >
            {/* Brand Label */}
            <motion.span
              variants={textVariants}
              className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light mb-5 text-lotus-gold"
            >
              {SLIDES[currentIndex].brand}
            </motion.span>

            {/* Heading */}
            <motion.h1
              variants={textVariants}
              className="font-display italic font-normal text-[48px] md:text-[64px] lg:text-[80px] text-white leading-[1.08] mb-6"
            >
              {SLIDES[currentIndex].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={textVariants}
              className="font-sans text-base md:text-lg text-white/80 leading-relaxed max-w-lg mb-8"
            >
              {SLIDES[currentIndex].subtitle}
            </motion.p>

            {/* CTA Row */}
            <motion.div
              variants={textVariants}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href={SLIDES[currentIndex].ctaPrimaryHref}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-lotus-rose text-white font-sans font-medium text-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,84,126,0.35)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {SLIDES[currentIndex].ctaPrimary}
              </a>
              <a
                href={SLIDES[currentIndex].ctaSecondaryHref}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/40 text-white font-sans font-medium text-sm transition-all duration-300 hover:bg-white/10"
              >
                {SLIDES[currentIndex].ctaSecondary}
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>



      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-lotus-deep/40 backdrop-blur-sm py-5 px-[5%]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 md:gap-0">
          {/* Stat 1 */}
          <div className="flex items-baseline gap-2 md:pr-10">
            <span className="text-xl md:text-2xl font-display font-semibold text-lotus-gold">
              1.200+
            </span>
            <span className="text-sm text-white/70 font-sans">
              Khách hàng
            </span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Stat 2 */}
          <div className="flex items-baseline gap-2 md:px-10">
            <span className="text-xl md:text-2xl font-display font-semibold text-lotus-gold">
              5
            </span>
            <span className="text-sm text-white/70 font-sans">
              Năm kinh nghiệm
            </span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Stat 3 */}
          <div className="flex items-baseline gap-2 md:pl-10">
            <span className="text-xl md:text-2xl font-display font-semibold text-lotus-gold">
              4.9★
            </span>
            <span className="text-sm text-white/70 font-sans">
              Đánh giá
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
