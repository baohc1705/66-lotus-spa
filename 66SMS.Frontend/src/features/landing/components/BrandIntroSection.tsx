import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Flower2 } from 'lucide-react'
import aboutBgCrane from '@/assets/about_bg_crane.png'
import spaMassage from '@/assets/spa_massage.png'

export const BrandIntroSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  return (
    <>
      {/* Trust KPI Section */}
      <section className="bg-lotus-cream pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* KPI 1 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white/40 backdrop-blur-sm border border-lotus-rose/10 rounded-2xl p-6 text-center shadow-sm hover:bg-white/60 transition-colors"
            >
              <span className="block font-display text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-rose leading-none mb-2">
                1.200+
              </span>
              <span className="block font-sans text-xs font-semibold text-lotus-deep uppercase tracking-wider mb-1">
                Khách Hàng
              </span>
              <span className="block font-sans text-xs text-lotus-stone">
                Tin tưởng & đồng hành trị liệu
              </span>
            </motion.div>

            {/* KPI 2 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/40 backdrop-blur-sm border border-lotus-rose/10 rounded-2xl p-6 text-center shadow-sm hover:bg-white/60 transition-colors"
            >
              <span className="block font-display text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-rose leading-none mb-2">
                15+
              </span>
              <span className="block font-sans text-xs font-semibold text-lotus-deep uppercase tracking-wider mb-1">
                Kỹ Thuật Viên
              </span>
              <span className="block font-sans text-xs text-lotus-stone">
                Chứng chỉ chuyên môn quốc tế
              </span>
            </motion.div>

            {/* KPI 3 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white/40 backdrop-blur-sm border border-lotus-rose/10 rounded-2xl p-6 text-center shadow-sm hover:bg-white/60 transition-colors"
            >
              <span className="block font-display text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-rose leading-none mb-2">
                5+
              </span>
              <span className="block font-sans text-xs font-semibold text-lotus-deep uppercase tracking-wider mb-1">
                Năm Kinh Nghiệm
              </span>
              <span className="block font-sans text-xs text-lotus-stone">
                Trong ngành chăm sóc sức khỏe
              </span>
            </motion.div>

            {/* KPI 4 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white/40 backdrop-blur-sm border border-lotus-rose/10 rounded-2xl p-6 text-center shadow-sm hover:bg-white/60 transition-colors"
            >
              <span className="block font-display text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-rose leading-none mb-2">
                4.9★
              </span>
              <span className="block font-sans text-xs font-semibold text-lotus-deep uppercase tracking-wider mb-1">
                Đánh Giá
              </span>
              <span className="block font-sans text-xs text-lotus-stone">
                Hài lòng tuyệt đối từ khách hàng
              </span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Brand Intro Content */}
      <section
        id="about"
        ref={sectionRef}
        className="relative py-16 md:py-24 bg-lotus-cream overflow-hidden"
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
              opacity: 0.15,
            }}
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Text Block */}
          <motion.div
            className="w-full md:w-[50%] md:pl-8 lg:pl-12 text-left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display font-normal text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-deep leading-[1.15] mb-6">
              Hoa Sen Spa – Chạm đến bình yên giữa lòng phố thị
            </h2>

            <div className="flex items-center justify-start mb-6">
              <div className="h-[1px] w-8 bg-lotus-rose/30" />
              <Flower2 className="mx-3 text-lotus-rose h-5 w-5" strokeWidth={1.5} />
              <div className="h-[1px] w-8 bg-lotus-rose/30" />
            </div>

            <p className="font-sans text-[1rem] text-lotus-stone leading-[1.6] max-w-[70ch] mb-4">
              Nằm giữa vùng đất sen hồng Đồng Tháp, Hoa Sen Spa ra đời với khát vọng mang tinh hoa thiên nhiên của xứ sở sen vào từng liệu trình phục hồi cơ thể và tinh thần chuyên sâu.
            </p>

            <p className="font-sans text-[1rem] text-lotus-stone leading-[1.6] max-w-[70ch] mb-8">
              Từ mùi hương thảo mộc dịu nhẹ, không gian yên bình đến đôi bàn tay điêu luyện của các kỹ thuật viên tâm huyết, chúng tôi cam kết đem lại trải nghiệm thư giãn trọn vẹn nhất cho hành trình tìm lại sự cân bằng trong bạn.
            </p>

            <a
              href="#services"
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-lotus-rose text-lotus-rose font-sans font-medium text-[0.875rem] hover:bg-lotus-rose hover:text-white transition-all duration-300"
            >
              Xem thêm →
            </a>
          </motion.div>

          {/* Arched Architectural Frame */}
          <motion.div
            className="w-full md:w-[50%] flex justify-center mt-12 md:mt-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="relative w-full max-w-[360px] aspect-[3/4] md:h-[550px] md:aspect-auto">
              {/* Offset border frame */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[180px] border border-lotus-gold/25" />
              {/* Main arched image */}
              <div className="absolute inset-0 rounded-t-[180px] overflow-hidden border border-lotus-gold/15 bg-lotus-cream shadow-none">
                <img
                  src={spaMassage}
                  alt="Không gian trị liệu và thư giãn tại Hoa Sen Spa"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
