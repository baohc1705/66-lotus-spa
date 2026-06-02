import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import spaHero from '@/assets/spa_hero.png'
import spaAbout from '@/assets/spa_about.png'
import spaFacial from '@/assets/spa_facial.png'
import spaMassage from '@/assets/spa_massage.png'
import spaProducts from '@/assets/spa_products.png'
import spaTreatment from '@/assets/spa_treatment_1780310830592.png'
import logoUrl from '@/assets/logo-home.png'

const GALLERY = [
  { src: spaHero,      alt: 'Không gian tiếp đón Hoa Sen Spa',         caption: 'Sảnh tiếp đón' },
  { src: spaAbout,     alt: 'Phòng trị liệu massage riêng tư',        caption: 'Phòng trị liệu' },
  { src: spaFacial,    alt: 'Phòng chăm sóc da mặt chuyên nghiệp',    caption: 'Facial Room' },
  { src: spaMassage,   alt: 'Phòng massage body cao cấp',              caption: 'Massage Room' },
  { src: spaProducts,  alt: 'Khu trưng bày sản phẩm skincare',         caption: 'Sản phẩm' },
  { src: spaTreatment, alt: 'Phòng body treatment thư giãn',           caption: 'Treatment Room' },
]

/* ── Lotus petal SVG ── */
const LotusPetal = ({ style, className = "" }: { style: React.CSSProperties, className?: string }) => (
  <div className={`petal absolute ${className}`} style={style}>
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
      <path
        d="M11 0C11 0 0 10 0 18C0 22.5 4.5 28 11 28C17.5 28 22 22.5 22 18C22 10 11 0 11 0Z"
        fill="var(--lotus-rose)"
        opacity="0.6"
      />
    </svg>
  </div>
)

/* ── Floating Background Petals (Out of Focus) ── */
const PETALS = Array.from({ length: 8 }, (_, i) => ({
  left: `${10 + Math.random() * 80}%`,
  animationDuration: `${14 + Math.random() * 10}s`,
  animationDelay: `-${Math.random() * 10}s`,
  transform: `scale(${0.4 + Math.random() * 0.8})`,
  className: Math.random() > 0.5 ? 'blur-[3px] opacity-40' : 'blur-[5px] opacity-20'
}))

export const SpaceGallerySection = () => {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const watermarkY1 = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const watermarkY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % GALLERY.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + GALLERY.length) % GALLERY.length)
  }, [])

  // Auto-play
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [isPaused, next])

  return (
    <section
      id="space"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-lotus-deep overflow-hidden"
    >
      {/* ── Creative Background ── */}
      
      {/* 1. Base Radial Glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lotus-gold/10 via-lotus-deep to-lotus-deep pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Logo Watermarks (Parallax) */}
      <motion.div
        style={{ y: watermarkY1 }}
        className="absolute -top-32 -left-32 w-[600px] opacity-[0.03] pointer-events-none -rotate-12 mix-blend-screen"
      >
        <img src={logoUrl} alt="" className="w-full h-full object-contain" />
      </motion.div>
      
      <motion.div
        style={{ y: watermarkY2 }}
        className="absolute -bottom-48 -right-40 w-[800px] opacity-[0.03] pointer-events-none rotate-12 mix-blend-screen"
      >
        <img src={logoUrl} alt="" className="w-full h-full object-contain" />
      </motion.div>

      {/* 3. Out-of-focus falling petals for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {PETALS.map((p, i) => (
          <LotusPetal
            key={i}
            className={p.className}
            style={{
              left: p.left,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              transform: p.transform
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            Không gian
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-white">
            Nơi bạn tìm về bình yên
          </h2>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={GALLERY[current].src}
                alt={GALLERY[current].alt}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-lotus-deep/90 via-lotus-deep/40 to-transparent">
              <AnimatePresence mode="wait">
                <motion.span
                  key={current}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-sans text-sm md:text-base text-white/90"
                >
                  {GALLERY[current].caption}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Nav Arrows */}
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-lotus-rose/80 hover:border-lotus-rose hover:scale-110 transition-all duration-300"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-lotus-rose/80 hover:border-lotus-rose hover:scale-110 transition-all duration-300"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {GALLERY.map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  i === current
                    ? 'border-lotus-gold shadow-[0_0_15px_rgba(184,151,106,0.4)] opacity-100 scale-110'
                    : 'border-transparent opacity-40 hover:opacity-100'
                }`}
                aria-label={`Xem ${item.caption}`}
              >
                <img
                  src={item.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
