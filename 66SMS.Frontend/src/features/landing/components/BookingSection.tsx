import { motion } from 'motion/react'
import { BookingForm } from './BookingForm'

export const BookingSection = () => {
  return (
    <section
      id="booking"
      className="py-20 md:py-28 bg-lotus-cream"
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            Đặt lịch
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-lotus-deep mb-4">
            Đặt lịch hẹn
          </h2>
          <p className="font-sans text-base text-lotus-stone max-w-md mx-auto">
            Chọn dịch vụ và thời gian phù hợp, chúng tôi sẽ liên hệ
            xác nhận ngay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BookingForm />
        </motion.div>
      </div>
    </section>
  )
}
