import { motion } from 'motion/react'
import { ShoppingBag } from 'lucide-react'

import spaProducts from '@/assets/spa_products.png'
import spaFacial from '@/assets/spa_facial.png'
import spaTreatment from '@/assets/spa_treatment_1780310830592.png'

const PRODUCTS = [
  {
    name: 'Tinh dầu Hoa Sen',
    description: 'Tinh dầu massage thiên nhiên chiết xuất từ hoa sen Đồng Tháp, giúp thư giãn và nuôi dưỡng làn da.',
    price: '350.000đ',
    imageSrc: spaProducts,
    imageAlt: 'Tinh dầu hoa sen tự nhiên',
  },
  {
    name: 'Kem dưỡng da sen',
    description: 'Kem dưỡng ẩm chiết xuất từ nhụy sen, cung cấp độ ẩm sâu và giúp da luôn mềm mịn.',
    price: '280.000đ',
    imageSrc: spaFacial,
    imageAlt: 'Kem dưỡng da chiết xuất sen',
  },
  {
    name: 'Bộ chăm sóc toàn diện',
    description: 'Bộ sản phẩm chăm sóc da hoàn chỉnh với các bước từ làm sạch đến dưỡng ẩm chuyên sâu.',
    price: '680.000đ',
    imageSrc: spaTreatment,
    imageAlt: 'Bộ sản phẩm chăm sóc da toàn diện',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const ProductsSection = () => {
  return (
    <section
      id="products"
      className="py-8 md:py-12 bg-lotus-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12 text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md">
            <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
              Sản phẩm
            </span>
            <h2 className="font-display italic font-normal text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-deep leading-[1.15]">
              Tinh hoa từ thiên nhiên
            </h2>
          </div>
          <p className="font-sans text-[1rem] text-lotus-stone max-w-md md:mb-1 leading-[1.6]">
            Các dòng sản phẩm chăm sóc da và trị liệu organic được chọn lọc kỹ lưỡng, mang trọn vẹn dưỡng chất tinh túy từ sen hồng Đồng Tháp.
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.name}
              variants={itemVariants}
              className="card-glow bg-white rounded-2xl overflow-hidden border border-lotus-rose/10 flex flex-col justify-between h-full"
            >
              {/* Top part */}
              <div>
                {/* Image — NO zoom on hover */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-display font-semibold text-[1.125rem] text-lotus-deep mb-2">
                    {product.name}
                  </h3>
                  <p className="font-sans text-[0.875rem] text-lotus-stone leading-[1.6]">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="p-6 pt-0 border-t border-lotus-rose/5 mt-4">
                <div className="flex items-center justify-between pt-4">
                  <span className="font-display font-semibold text-lg text-lotus-rose">
                    {product.price}
                  </span>
                  <a
                    href="#booking"
                    className="inline-flex items-center gap-2 font-sans text-sm font-medium text-lotus-gold hover:text-lotus-rose border-b border-lotus-gold/25 hover:border-lotus-rose/40 pb-0.5 transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Mua ngay
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
