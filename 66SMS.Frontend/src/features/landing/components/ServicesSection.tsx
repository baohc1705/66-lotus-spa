import { motion } from 'motion/react'

import spaMassage from '@/assets/spa_massage.png'
import spaFacial from '@/assets/spa_facial.png'
import spaTreatment from '@/assets/spa_treatment_1780310830592.png'
import spaProducts from '@/assets/spa_products.png'

const SERVICES = [
  {
    title: 'Massage',
    description:
      'Xua tan mệt mỏi, tái tạo năng lượng cơ thể với kỹ thuật massage chuyên sâu kết hợp tinh dầu thiên nhiên.',
    price: '350.000đ',
    imageSrc: spaMassage,
    imageAlt: 'Massage trị liệu tại Hoa Sen Spa',
  },
  {
    title: 'Chăm sóc da mặt',
    description:
      'Liệu trình chăm sóc da mặt chuyên sâu với dưỡng chất hoa sen tự nhiên, giúp da sáng mịn và khỏe mạnh.',
    price: '280.000đ',
    imageSrc: spaFacial,
    imageAlt: 'Chăm sóc da mặt facial tại Hoa Sen Spa',
  },
  {
    title: 'Body Treatment',
    description:
      'Phương pháp phục hồi sức khỏe toàn diện với thảo dược cổ truyền và kỹ thuật trị liệu hiện đại.',
    price: '420.000đ',
    imageSrc: spaTreatment,
    imageAlt: 'Body treatment trị liệu thảo dược tại Hoa Sen Spa',
  },
  {
    title: 'Sản phẩm & Gói',
    description:
      'Các sản phẩm chăm sóc da và gói dịch vụ ưu đãi dành riêng cho khách hàng thân thiết.',
    price: '180.000đ',
    imageSrc: spaProducts,
    imageAlt: 'Sản phẩm skincare tại Hoa Sen Spa',
  },
]

export const ServicesSection = () => {
  return (
    <section
      id="services"
      className="py-12 md:py-16 bg-lotus-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12 text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md">
            <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
              Dịch vụ
            </span>
            <h2 className="font-display italic font-normal text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-deep leading-[1.15]">
              Chăm sóc trọn vẹn
            </h2>
          </div>
          <p className="font-sans text-[1rem] text-lotus-stone max-w-md md:mb-1 leading-[1.6]">
            Các liệu pháp chăm sóc được thiết kế riêng biệt nhằm phục hồi năng lượng và đem lại sự thư giãn sâu sắc cho cả cơ thể lẫn tâm hồn.
          </p>
        </motion.div>

        {/* Editorial Alternating Layout */}
        <div className="space-y-16 md:space-y-24 mt-12 md:mt-16">
          {SERVICES.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                
                {/* Image Column */}
                <div
                  className={`lg:col-span-6 order-1 ${
                    isEven ? 'lg:order-first' : 'lg:order-last'
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-t-[120px] overflow-hidden border border-lotus-rose/10 shadow-sm group">
                    <img
                      src={service.imageSrc}
                      alt={service.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Text Content Column */}
                <div className="lg:col-span-6 order-2 text-left flex flex-col justify-center">
                  <span className="block font-sans text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-2">
                    0{index + 1} / Liệu Trình
                  </span>
                  
                  <h3 className="font-display italic font-normal text-2xl md:text-3xl text-lotus-deep mb-4">
                    {service.title}
                  </h3>

                  <p className="font-sans text-[1rem] leading-[1.6] text-lotus-stone mb-6 max-w-md">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="font-sans text-sm font-semibold text-lotus-rose bg-lotus-rose/5 border border-lotus-rose/10 px-3 py-1.5 rounded-lg w-fit">
                      Từ {service.price}
                    </span>
                    <a
                      href="#booking"
                      className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-lotus-rose text-white font-sans font-medium text-[0.875rem] transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      Đặt lịch hẹn
                    </a>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
