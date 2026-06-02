import { motion } from 'motion/react'
import { Phone, ClipboardList, Sparkles, Heart, Star } from 'lucide-react'

const STEPS = [
  {
    icon: Phone,
    title: 'Đặt lịch',
    description: 'Liên hệ hoặc đặt lịch online. Chúng tôi sẽ xác nhận ngay.',
  },
  {
    icon: ClipboardList,
    title: 'Tư vấn',
    description: 'Kỹ thuật viên tư vấn liệu trình phù hợp với nhu cầu của bạn.',
  },
  {
    icon: Sparkles,
    title: 'Trải nghiệm',
    description: 'Thư giãn và tận hưởng liệu trình trong không gian yên bình.',
  },
  {
    icon: Heart,
    title: 'Chăm sóc sau',
    description: 'Hướng dẫn chăm sóc tại nhà và theo dõi kết quả.',
  },
  {
    icon: Star,
    title: 'Trở lại',
    description: 'Đặt lịch hẹn tiếp theo để duy trì sức khỏe và sắc đẹp.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export const ProcessTimeline = () => {
  return (
    <section
      id="process"
      className="py-20 md:py-28 bg-lotus-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            Quy trình
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl lg:text-5xl text-lotus-deep">
            5 bước trải nghiệm
          </h2>
        </motion.div>

        {/* Desktop: Horizontal Timeline */}
        <motion.div
          className="hidden md:block relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Line */}
          <div className="timeline-line" />

          <div className="grid grid-cols-5 gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  variants={stepVariants}
                  className="timeline-step"
                >
                  {/* Icon Circle */}
                  <div className="timeline-icon">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* Step Number */}
                  <span className="font-display font-bold text-sm text-lotus-gold">
                    0{i + 1}
                  </span>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-base text-lotus-deep text-center">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs text-lotus-stone text-center leading-relaxed max-w-[180px]">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Mobile: Vertical Timeline */}
        <motion.div
          className="md:hidden space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                variants={stepVariants}
                className="flex items-start gap-4"
              >
                {/* Left: Icon + Line */}
                <div className="flex flex-col items-center">
                  <div className="timeline-icon shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px h-10 bg-gradient-to-b from-lotus-gold to-lotus-rose/30 mt-2" />
                  )}
                </div>

                {/* Right: Text */}
                <div className="pt-2">
                  <span className="font-display font-bold text-xs text-lotus-gold">
                    Bước 0{i + 1}
                  </span>
                  <h3 className="font-display font-semibold text-base text-lotus-deep mt-0.5">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm text-lotus-stone leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
