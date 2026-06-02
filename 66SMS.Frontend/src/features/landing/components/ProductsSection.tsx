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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export const ProductsSection = () => {
  return (
    <section
      id="products"
      className="py-20 md:py-28 bg-lotus-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            Sản phẩm
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-lotus-deep">
            Tinh hoa từ thiên nhiên
          </h2>
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
              className="card-glow bg-white rounded-2xl overflow-hidden border border-lotus-rose/10"
            >
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
                <h3 className="font-display font-semibold text-lg text-lotus-deep mb-2">
                  {product.name}
                </h3>
                <p className="font-sans text-sm text-lotus-stone leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-lg text-lotus-rose">
                    {product.price}
                  </span>
                  <a
                    href="#booking"
                    className="inline-flex items-center gap-2 font-sans text-sm font-medium text-lotus-gold hover:text-lotus-rose transition-colors duration-300"
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
