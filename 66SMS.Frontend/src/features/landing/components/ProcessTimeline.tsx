import { motion } from 'motion/react'
import { ClipboardList, Sparkles, Heart, Star, UserCheck } from 'lucide-react'

const STEPS = [
  {
    icon: UserCheck,
    title: 'Đón tiếp (Arrival)',
    description: 'Chào mừng bạn đến với Hoa Sen Spa bằng trà thảo mộc thơm lành và khăn ấm mát lạnh để rũ bỏ cát bụi.',
  },
  {
    icon: ClipboardList,
    title: 'Tham vấn (Consultation)',
    description: 'Chuyên viên lắng nghe trạng thái sức khỏe, mong muốn và kiểm tra cơ thể để tư vấn liệu trình phù hợp nhất.',
  },
  {
    icon: Sparkles,
    title: 'Trị liệu (Treatment)',
    description: 'Tận hưởng kỹ thuật massage điêu luyện kết hợp dược thảo tự nhiên trong phòng riêng ấm cúng, riêng tư.',
  },
  {
    icon: Heart,
    title: 'Thư giãn (Relaxation)',
    description: 'Thưởng trà, dùng cháo sen bổ dưỡng và nghỉ ngơi sâu tại không gian sảnh chờ tràn ngập hương thơm dịu nhẹ.',
  },
  {
    icon: Star,
    title: 'Chăm sóc sau (Aftercare)',
    description: 'Hướng dẫn các bài tập thở, chế độ sinh hoạt và theo dõi sát sao tiến trình phục hồi cơ thể sau liệu trình.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const stepVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const ProcessTimeline = () => {
  return (
    <section
      id="process"
      className="py-16 md:py-24 bg-lotus-cream"
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
              Trải nghiệm
            </span>
            <h2 className="font-display italic font-normal text-[clamp(2rem,3vw,2.8rem)] text-lotus-deep leading-[1.15]">
              Hành trình phục hồi
            </h2>
          </div>
          <p className="font-sans text-[1rem] text-lotus-stone max-w-md md:mb-1 leading-[1.6]">
            Một chu trình khép kín tinh tế được thiết kế để chăm sóc trọn vẹn cả thân - tâm - trí của bạn từ lúc đặt chân đến.
          </p>
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
