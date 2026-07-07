import { motion } from 'motion/react'
import { BookingForm } from './BookingForm'

export const BookingSection = () => {
  return (
    <section
      id="booking"
      className="pt-8 pb-16 md:pt-12 md:pb-24 bg-lotus-cream"
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-4">
            Đặt lịch
          </span>
          <h2 className="font-display italic font-normal text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-deep leading-[1.15] mb-4">
            Đặt lịch hẹn
          </h2>
          <p className="font-sans text-[1rem] leading-[1.6] text-lotus-stone max-w-md mx-auto">
            Chọn dịch vụ và thời gian phù hợp, chúng tôi sẽ liên hệ xác nhận ngay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <BookingForm />
        </motion.div>
      </div>
    </section>
  )
}
