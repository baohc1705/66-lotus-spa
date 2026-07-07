import { motion } from 'motion/react'
import spaHero from '@/assets/spa_hero.png'
import spaAbout from '@/assets/spa_about.png'
import spaFacial from '@/assets/spa_facial.png'
import spaMassage from '@/assets/spa_massage.png'
import spaProducts from '@/assets/spa_products.png'
import spaTreatment from '@/assets/spa_treatment_1780310830592.png'

const GALLERY = [
  { src: spaHero, alt: 'Không gian tiếp đón Hoa Sen Spa', caption: 'Sảnh tiếp đón' },
  { src: spaAbout, alt: 'Phòng trị liệu massage riêng tư', caption: 'Không gian tĩnh lặng' },
  { src: spaFacial, alt: 'Phòng chăm sóc da mặt chuyên nghiệp', caption: 'Chăm sóc chuyên sâu' },
  { src: spaMassage, alt: 'Phòng massage body cao cấp', caption: 'Massage trị liệu' },
  { src: spaProducts, alt: 'Khu trưng bày sản phẩm skincare', caption: 'Dược liệu hữu cơ' },
  { src: spaTreatment, alt: 'Phòng body treatment thư giãn', caption: 'Trị liệu toàn thân' },
]

export const SpaceGallerySection = () => {
  return (
    <section
      id="space"
      className="py-16 md:py-24 bg-lotus-deep overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
            Không gian
          </span>
          <h2 className="font-display italic font-normal text-[clamp(2rem,3vw,2.8rem)] text-white leading-[1.15]">
            Nơi bạn tìm về bình yên
          </h2>
        </motion.div>

        {/* Editorial Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] w-full rounded-t-[100px] overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[0].src}
                alt={GALLERY[0].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[0].caption}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[4].src}
                alt={GALLERY[4].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[4].caption}</span>
              </div>
            </motion.div>
          </div>

          {/* Column 2 (Staggered Down) */}
          <div className="flex flex-col gap-6 md:pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[1].src}
                alt={GALLERY[1].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[1].caption}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="relative aspect-[4/5] w-full rounded-b-[100px] overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[5].src}
                alt={GALLERY[5].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[5].caption}</span>
              </div>
            </motion.div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[3].src}
                alt={GALLERY[3].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[3].caption}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative aspect-[3/4] w-full rounded-t-[100px] overflow-hidden border border-white/10 shadow-sm group"
            >
              <img
                src={GALLERY[2].src}
                alt={GALLERY[2].alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="font-sans text-xs text-white/80">{GALLERY[2].caption}</span>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  )
}

