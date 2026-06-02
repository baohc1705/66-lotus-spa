import { motion } from 'motion/react'
import { ServiceCard } from './ServiceCard'
import { Accordion } from './Accordion'

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
      className="pt-10 md:pt-12 pb-20 md:pb-28 bg-lotus-cream"
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
            Dịch vụ
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-lotus-deep">
            Chăm sóc trọn vẹn
          </h2>
        </motion.div>

        {/* Desktop: Hover Panels */}
        <motion.div
          className="hidden md:flex services-panel-container rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.title}
              {...service}
            />
          ))}
        </motion.div>

        {/* Mobile: Accordion */}
        <div className="md:hidden">
          <Accordion
            items={SERVICES.map((service) => ({
              title: `${service.title} — Từ ${service.price}`,
              content: (
                <div>
                  <img
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={360}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <p className="font-sans text-sm text-lotus-stone leading-relaxed mb-3">
                    {service.description}
                  </p>
                  <a
                    href="#booking"
                    className="inline-block text-sm font-medium text-lotus-rose hover:text-lotus-deep transition-colors duration-300"
                  >
                    Đặt lịch →
                  </a>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </section>
  )
}
