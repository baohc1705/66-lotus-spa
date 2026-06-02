import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'

/* ── Quiz Data ── */
interface QuizQuestion {
  question: string
  options: string[]
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'Loại da của bạn là gì?',
    options: ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm'],
  },
  {
    question: 'Bạn muốn cải thiện điều gì nhất?',
    options: ['Thư giãn, giảm stress', 'Trẻ hóa làn da', 'Giảm đau nhức cơ thể', 'Detox & thanh lọc'],
  },
  {
    question: 'Ngân sách của bạn?',
    options: ['Dưới 300K', '300K – 500K', '500K – 800K', 'Trên 800K'],
  },
]

interface QuizResult {
  service: string
  description: string
  price: string
}

function getResult(answers: number[]): QuizResult {
  const [skin, goal, budget] = answers

  // Simple logic mapping answers to recommendations
  if (goal === 0) {
    return {
      service: 'Massage Thư Giãn',
      description: 'Liệu trình massage toàn thân kết hợp tinh dầu hoa sen, giúp bạn xua tan mọi căng thẳng và tìm lại sự cân bằng.',
      price: budget <= 1 ? '350.000đ' : '520.000đ',
    }
  }
  if (goal === 1) {
    return {
      service: 'Chăm Sóc Da Mặt Chuyên Sâu',
      description: `Liệu trình facial đặc biệt cho ${skin === 0 ? 'da dầu' : skin === 1 ? 'da khô' : skin === 3 ? 'da nhạy cảm' : 'da hỗn hợp'}, sử dụng dưỡng chất từ hoa sen tự nhiên Đồng Tháp.`,
      price: budget <= 1 ? '280.000đ' : '450.000đ',
    }
  }
  if (goal === 2) {
    return {
      service: 'Body Treatment',
      description: 'Liệu trình trị liệu cơ thể kết hợp thảo dược cổ truyền, giúp giảm đau nhức và phục hồi sức khỏe toàn diện.',
      price: budget <= 1 ? '420.000đ' : '650.000đ',
    }
  }
  return {
    service: 'Gói Detox Toàn Diện',
    description: 'Chương trình thanh lọc cơ thể từ bên trong, kết hợp xông hơi, tẩy tế bào chết và massage thư giãn.',
    price: budget <= 2 ? '480.000đ' : '780.000đ',
  }
}

export const QuizSection = () => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx]
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setShowResult(true)
    }
  }

  const reset = () => {
    setStep(0)
    setAnswers([])
    setShowResult(false)
  }

  const result = showResult ? getResult(answers) : null
  const progress = showResult ? 100 : ((step) / QUESTIONS.length) * 100

  return (
    <section
      id="quiz"
      className="py-20 md:py-28 bg-lotus-rose-light"
    >
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <span className="block text-[13px] tracking-[0.2em] uppercase font-sans font-light text-lotus-gold mb-4">
            <Sparkles className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            Khám phá
          </span>
          <h2 className="font-display italic font-normal text-3xl md:text-4xl text-lotus-deep mb-3">
            Liệu trình nào phù hợp với bạn?
          </h2>
          <p className="font-sans text-sm text-lotus-stone">
            Trả lời 3 câu hỏi nhanh để nhận gợi ý cá nhân hóa
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="quiz-progress mb-8">
          <div className="quiz-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-lotus min-h-[320px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={`q-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question */}
                <div className="mb-2">
                  <span className="font-sans text-xs font-medium text-lotus-gold uppercase tracking-wider">
                    Câu {step + 1} / {QUESTIONS.length}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-medium text-lotus-deep mb-8">
                  {QUESTIONS[step].question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((option, i) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(i)}
                      className="group text-left px-5 py-4 rounded-xl border border-lotus-rose/20 font-sans text-sm text-lotus-deep transition-all duration-300 hover:border-lotus-rose hover:bg-lotus-rose/5 hover:shadow-[0_2px_12px_rgba(212,84,126,0.12)] active:scale-[0.98]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border border-lotus-rose/30 flex items-center justify-center text-xs font-medium text-lotus-rose group-hover:bg-lotus-rose group-hover:text-white transition-colors">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-lotus-rose/10 flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-7 h-7 text-lotus-rose" />
                </div>

                <h3 className="font-display text-2xl font-semibold text-lotus-deep mb-2">
                  {result!.service}
                </h3>
                <p className="font-sans text-sm text-lotus-stone leading-relaxed mb-4 max-w-md mx-auto">
                  {result!.description}
                </p>
                <p className="font-display font-semibold text-xl text-lotus-rose mb-6">
                  Từ {result!.price}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="#booking"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-lotus-rose text-white font-sans font-medium text-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,84,126,0.35)] hover:-translate-y-0.5"
                  >
                    Đặt lịch ngay
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-lotus-stone/30 text-lotus-stone font-sans text-sm font-medium transition-colors hover:border-lotus-rose hover:text-lotus-rose"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Làm lại
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
