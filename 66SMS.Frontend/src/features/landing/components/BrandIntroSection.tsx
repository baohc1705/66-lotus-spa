import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Flower2 } from 'lucide-react'
import aboutBgCrane from '@/assets/about_bg_crane.png'
import spaAbout from '@/assets/spa_about.png'
import spaMassage from '@/assets/spa_massage.png'

const MARQUEE_ITEMS = 'Facial · Massage · Body Treatment · Skincare · Detox · '

export const BrandIntroSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  return (
    <>
      {/* Marquee Divider */}
      <div className="py-4 bg-lotus-cream border-y border-lotus-gold/20">
        <div className="marquee">
          <span className="marquee__inner text-[13px] tracking-[0.15em] uppercase font-sans font-light text-lotus-gold">
            {MARQUEE_ITEMS}{MARQUEE_ITEMS}
          </span>
        </div>
      </div>

      {/* Brand Intro Content */}
      <section
        id="about"
        ref={sectionRef}
        className="relative pt-20 md:pt-28 pb-10 md:pb-12 bg-lotus-cream overflow-hidden"
      >
        {/* Parallax Crane Background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute bottom-0 left-0 w-full md:w-[800px] h-[500px] md:h-[700px] z-0 pointer-events-none mix-blend-multiply"
          aria-hidden="true"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${aboutBgCrane})`,
              backgroundSize: 'contain',
              backgroundPosition: 'left bottom',
              backgroundRepeat: 'no-repeat',
              WebkitMaskImage: 'radial-gradient(ellipse at 0% 100%, black 50%, transparent 85%)',
              maskImage: 'radial-gradient(ellipse at 0% 100%, black 50%, transparent 85%)',
            }}
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          {/* Text Block */}
          <motion.div
            className="w-full md:w-[50%] md:pl-8 lg:pl-12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display font-medium text-3xl md:text-4xl lg:text-[40px] text-lotus-rose leading-snug mb-4">
              Hoa Sen Spa – Chạm đến bình yên giữa lòng phố thị
            </h2>

            <div className="flex items-center justify-start mb-6">
              <div className="h-[1px] w-8 bg-lotus-rose/30" />
              <Flower2 className="mx-3 text-lotus-rose h-5 w-5" strokeWidth={1.5} />
              <div className="h-[1px] w-8 bg-lotus-rose/30" />
            </div>

            <p className="font-sans text-[15px] text-lotus-deep/80 leading-relaxed mb-4">
              Nằm giữa vùng đất sen hồng Đồng Tháp — nơi những cánh đồng sen
              bạt ngàn trải dài dưới nắng trời phương Nam, Hoa Sen Spa ra đời
              với khát vọng mang tinh hoa thiên nhiên vào từng liệu trình
              chăm sóc sức khỏe và sắc đẹp.
            </p>

            <p className="font-sans text-[15px] text-lotus-deep/80 leading-relaxed mb-4">
              Từ mùi hương dịu nhẹ của tinh dầu, âm thanh êm đềm của thiên nhiên
              đến đôi bàn tay điêu luyện của các kỹ thuật viên — tất cả tạo nên
              một trải nghiệm thư giãn trọn vẹn, đưa bạn thoát khỏi áp lực
              thường ngày, trở về với chính mình.
            </p>

            <p className="font-sans text-[15px] text-lotus-deep/80 leading-relaxed mb-8">
              Tại Hoa Sen Spa, mỗi kỹ thuật viên không những được đào tạo bài bản
              về chuyên môn mà còn luôn làm việc với trái tim đầy nhiệt huyết,
              giúp bạn phục hồi năng lượng trong từng phút giây.
            </p>

            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-2.5 rounded-full border border-lotus-rose text-lotus-rose font-sans text-sm font-medium hover:bg-lotus-rose hover:text-white transition-colors duration-300"
            >
              Xem thêm →
            </a>
          </motion.div>

          {/* Creative Image Gallery */}
          <motion.div
            className="w-full md:w-[50%] relative h-[500px] md:h-[650px] mt-12 md:mt-0"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {/* Main image — Vertical Pill */}
            <div className="absolute right-0 top-0 w-[70%] h-[85%] rounded-[100px] overflow-hidden shadow-2xl">
              <img
                src={spaMassage}
                alt="Thư giãn"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlapping secondary — Circle */}
            <div className="absolute left-0 bottom-[5%] w-[55%] aspect-square rounded-full overflow-hidden border-[8px] border-lotus-cream shadow-2xl z-10">
              <img
                src={spaAbout}
                alt="Không gian spa"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Stats Card — Glassmorphism */}
            <motion.div
              className="absolute top-[15%] left-0 md:-left-8 z-20 bg-white/80 backdrop-blur-md border border-white/50 px-6 py-5 rounded-[2rem] shadow-xl flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-lotus-gold flex items-center justify-center text-white shadow-inner">
                <Flower2 size={24} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl text-lotus-deep leading-none">10+ Năm</span>
                <span className="font-sans text-[13px] text-lotus-stone mt-1">Kinh nghiệm spa</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
