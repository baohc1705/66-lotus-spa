import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import spaMassage from '@/assets/spa_massage.png'
import spaAbout from '@/assets/spa_about.png'

export const AboutSection = () => {
  return (
    <section
      id="why-choose-us"
      className="py-16 md:py-24 bg-lotus-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Heading */}
        <motion.div
          className="max-w-2xl text-left mb-16"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
            <Sparkles className="w-4 h-4 inline-block mr-1 -mt-0.5" strokeWidth={1.5} />
            Giá trị cốt lõi
          </span>
          <h2 className="font-display italic font-normal text-[clamp(2rem,3vw,2.8rem)] text-lotus-deep leading-[1.15] mb-6">
            Nghệ thuật trong từng điểm chạm
          </h2>
          <p className="font-sans text-[1.1rem] leading-[1.6] text-lotus-stone max-w-xl">
            Tại Hoa Sen Spa, sự chữa lành bắt đầu từ những điểm chạm chân thành nhất. Không chỉ là massage, đó là kỹ nghệ phục hồi kết hợp giữa đôi tay điêu luyện của trị liệu viên và sinh khí của dược thảo Việt Nam.
          </p>
        </motion.div>

        {/* Asymmetric Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (takes 5 cols) */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Story Block 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-left"
            >
              <span className="block font-sans text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-2">
                01 / Tay Nghề Trị Liệu
              </span>
              <h3 className="font-display italic text-xl md:text-2xl text-lotus-deep mb-3">
                Kỹ nghệ chạm chữa lành
              </h3>
              <p className="font-sans text-[1rem] leading-[1.6] text-lotus-stone">
                Đội ngũ trị liệu viên của chúng tôi được đào tạo chuyên sâu và sở hữu chứng chỉ chuyên môn Đông Y cổ truyền. Mỗi động tác ấn huyệt, miết cơ đều mang sự thấu hiểu sâu sắc đối với cơ thể bạn để xoa dịu các điểm nghẽn đau nhức một cách chính xác.
              </p>
            </motion.div>

            {/* Asymmetric Image Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[3/4] w-full rounded-t-[140px] overflow-hidden border border-lotus-rose/10 shadow-sm"
            >
              <img
                src={spaMassage}
                alt="Massage trị liệu thảo mộc tại Hoa Sen Spa"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.div>

          </div>

          {/* Middle Spacer for Desktop */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Right Column (takes 6 cols) */}
          <div className="lg:col-span-6 space-y-12 lg:pt-16">
            
            {/* Asymmetric Image Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-[4/3] w-full rounded-b-[140px] overflow-hidden border border-lotus-rose/10 shadow-sm"
            >
              <img
                src={spaAbout}
                alt="Không gian an tĩnh tại Hoa Sen Spa"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Story Block 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-left"
            >
              <span className="block font-sans text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-2">
                02 / Thảo Dược Bản Địa
              </span>
              <h3 className="font-display italic text-xl md:text-2xl text-lotus-deep mb-3">
                Tinh túy từ sen hồng Đồng Tháp
              </h3>
              <p className="font-sans text-[1rem] leading-[1.6] text-lotus-stone">
                Chúng tôi sử dụng nguồn dược chất hữu cơ tự nhiên được chưng cất từ sen Đồng Tháp và các loại thảo mộc Việt Nam. Không chứa chất hóa học, tinh khiết nuôi dưỡng làn da và khơi dậy các giác quan thông qua mùi hương nhẹ nhàng, thanh tao.
              </p>
            </motion.div>

            {/* Story Block 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-left"
            >
              <span className="block font-sans text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-2">
                03 / Không Gian & Giác Quan
              </span>
              <h3 className="font-display italic text-xl md:text-2xl text-lotus-deep mb-3">
                Ngắt kết nối, chạm bình yên
              </h3>
              <p className="font-sans text-[1rem] leading-[1.6] text-lotus-stone">
                Tại Hoa Sen Spa, âm thanh êm dịu, ánh sáng vàng ấm và mùi gỗ trầm lan tỏa được thiết kế tỉ mỉ để tạo ra một ốc đảo an tĩnh. Giúp bạn hoàn toàn rũ bỏ mọi ồn ào lo toan từ thế giới bên ngoài ngay khi vừa bước chân qua cửa sổ mái vòm.
              </p>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  )
}
