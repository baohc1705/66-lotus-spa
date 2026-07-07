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
      className="py-12 md:py-16 bg-lotus-rose-light"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Heading & Description (takes 2 cols) */}
          <div className="md:col-span-2 text-left">
            <span className="block text-[0.75rem] tracking-[0.2em] uppercase font-sans font-medium text-lotus-gold mb-3">
              <Sparkles className="w-4 h-4 inline-block mr-1 -mt-0.5" strokeWidth={1.5} />
              Khám phá
            </span>
            <h2 className="font-display italic font-normal text-[clamp(1.8rem,3vw,2.4rem)] text-lotus-deep mb-4 leading-[1.15]">
              Liệu trình nào phù hợp với bạn?
            </h2>
            <p className="font-sans text-[1rem] text-lotus-stone leading-[1.6] max-w-[70ch] mb-6">
              Mỗi cơ thể và làn da đều mang những câu chuyện riêng. Chỉ cần trả lời 3 câu hỏi trắc nghiệm nhanh, chúng tôi sẽ gợi ý liệu trình tối ưu nhất dành riêng cho nhu cầu và mong muốn phục hồi của bạn.
            </p>
            <div className="hidden md:block p-5 rounded-2xl border border-lotus-rose/10 bg-white/40">
              <span className="block font-sans text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-1">
                Gợi ý tức thì
              </span>
              <p className="font-sans text-xs text-lotus-stone leading-normal">
                Hệ thống tự động phân tích và đưa ra các đề xuất về thời gian, liệu pháp cùng mức chi phí phù hợp nhất.
              </p>
            </div>
          </div>

          {/* Right Column: Quiz Form (takes 3 cols) */}
          <div className="md:col-span-3">
            {/* Progress Bar */}
            <div className="quiz-progress mb-6">
              <div className="quiz-progress__bar" style={{ width: `${progress}%` }} />
            </div>

            {/* Quiz Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-lotus-rose/10 min-h-[320px] flex flex-col justify-center">
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
                      <span className="font-sans text-[0.75rem] font-medium text-lotus-gold uppercase tracking-wider">
                        Câu {step + 1} / {QUESTIONS.length}
                      </span>
                    </div>
                    <h3 className="font-display text-[1.125rem] font-medium text-lotus-deep mb-8">
                      {QUESTIONS[step].question}
                    </h3>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {QUESTIONS[step].options.map((option, i) => (
                        <button
                          key={option}
                          onClick={() => handleSelect(i)}
                          className="group text-left h-12 px-5 rounded-lg border border-lotus-rose/20 font-sans text-sm text-lotus-deep transition-all duration-300 hover:border-lotus-rose hover:bg-lotus-rose/5 hover:shadow-[0_2px_12px_rgba(212,84,126,0.12)] active:scale-[0.98]"
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
                    <Sparkles className="w-10 h-10 text-lotus-rose mx-auto mb-4" strokeWidth={1.5} />

                    <h3 className="font-display text-[1.125rem] font-semibold text-lotus-deep mb-2">
                      {result!.service}
                    </h3>
                    <p className="font-sans text-[0.875rem] text-lotus-stone leading-[1.6] mb-4 max-w-md mx-auto">
                      {result!.description}
                    </p>
                    <p className="font-display font-semibold text-xl text-lotus-rose mb-6">
                      Từ {result!.price}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href="#booking"
                        className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-lotus-rose text-white font-sans font-medium text-[0.875rem] transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Đặt lịch ngay
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                      <button
                        onClick={reset}
                        className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-lotus-stone/30 text-lotus-stone font-sans font-medium text-[0.875rem] transition-colors hover:border-lotus-rose hover:text-lotus-rose"
                      >
                        <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                        Làm lại
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
