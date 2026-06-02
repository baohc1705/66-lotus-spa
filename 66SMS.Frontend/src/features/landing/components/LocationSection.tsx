import { motion } from 'motion/react'
import { MapPin, Phone, Clock } from 'lucide-react'

export const LocationSection = () => {
  return (
    <section
      id="location"
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
            Vị trí
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-lotus-deep">
            Tìm đến chúng tôi
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Map — takes 3 cols on desktop */}
          <motion.div
            className="md:col-span-3 rounded-2xl overflow-hidden shadow-lotus h-[300px] md:h-[400px]"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <iframe
              title="Hoa Sen Spa — Đồng Tháp"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.8!2d105.63!3d10.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI3JzAwLjAiTiAxMDXCsDM3JzQ4LjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </motion.div>

          {/* Branch Info — takes 2 cols */}
          <motion.div
            className="md:col-span-2 flex flex-col justify-center"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h3 className="font-display font-semibold text-xl text-lotus-deep mb-6">
              Chi nhánh Cao Lãnh
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lotus-rose/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-lotus-rose" />
                </div>
                <div>
                  <span className="block font-sans text-sm font-medium text-lotus-deep">Địa chỉ</span>
                  <span className="font-sans text-sm text-lotus-stone">
                    123 Đường Lê Lợi, TP. Cao Lãnh, Đồng Tháp
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lotus-rose/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-lotus-rose" />
                </div>
                <div>
                  <span className="block font-sans text-sm font-medium text-lotus-deep">Điện thoại</span>
                  <a
                    href="tel:09079593951"
                    className="font-sans text-sm text-lotus-stone hover:text-lotus-rose transition-colors duration-300"
                  >
                    0907 95 93 95
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lotus-rose/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-lotus-rose" />
                </div>
                <div>
                  <span className="block font-sans text-sm font-medium text-lotus-deep">Giờ mở cửa</span>
                  <span className="font-sans text-sm text-lotus-stone">
                    8:00 – 21:00, Thứ 2 – Chủ nhật
                  </span>
                </div>
              </li>
            </ul>

            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center px-6 py-3 rounded-full border border-lotus-rose text-lotus-rose font-sans text-sm font-medium hover:bg-lotus-rose hover:text-white transition-colors duration-300 w-fit"
            >
              Chỉ đường →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
