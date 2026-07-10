import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Footprints,
  HeartPulse,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface FaqItem {
  question: string;
  answer: ReactNode;
  Icon: LucideIcon;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Tôi cần đặt lịch trước bao lâu?",
    answer:
      "Nên đặt trước ít nhất 24 giờ, đặc biệt cuối tuần. Bạn đặt online hoặc gọi 0907 95 93 95 — chúng tôi xác nhận trong 2 giờ làm việc.",
    Icon: CalendarDays,
  },
  {
    question: "Spa có nhận khách walk-in không?",
    answer:
      "Có, nếu còn lịch trống. Đặt trước giúp bạn chọn đúng kỹ thuật viên và khung giờ mong muốn.",
    Icon: Footprints,
  },
  {
    question: "Liệu trình có phù hợp khi mang thai?",
    answer:
      "Có liệu trình prenatal chuyên biệt sau tuần 12, do kỹ thuật viên được chứng nhận thực hiện.",
    Icon: HeartPulse,
  },
  {
    question: "Chính sách hủy hoặc đổi lịch?",
    answer:
      "Đổi hoặc hủy miễn phí trước 6 giờ. Hủy muộn hơn có thể tính phí 30% giá dịch vụ.",
    Icon: ShieldCheck,
  },
  {
    question: "Có bán sản phẩm mang về không?",
    answer:
      "Có — tinh dầu sen, kem dưỡng và serum tại quầy. Khách dùng dịch vụ được giảm 10% lần mua đầu.",
    Icon: ShoppingBag,
  },
];

const FaqRow = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;
  const Icon = item.Icon;

  return (
    <div className="border-b border-lotus-deep/8 last:border-b-0">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="landing-focus-ring flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
      >
        {/* Icon tròn trái */}
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lotus-rose/12 text-lotus-rose sm:h-11 sm:w-11"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={1.75} />
        </span>

        <span className="min-w-0 flex-1 font-geist text-base font-medium leading-snug text-lotus-deep">
          {item.question}
        </span>

        {/* Nút +/- tròn phải */}
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-lotus-rose text-lotus-rose"
          aria-hidden="true"
        >
          {isOpen ? (
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="bg-lotus-rose/8 px-4 py-4 sm:px-6 sm:py-5">
              <p className="pl-[3.25rem] font-geist text-sm leading-[1.7] text-lotus-stone sm:pl-[3.75rem]">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="landing-section bg-lotus-cream"
      aria-labelledby="faq-heading"
    >
      <div className="landing-container">
        <SectionHeader
          title="Câu hỏi thường gặp"
          titleId="faq-heading"
          variant="lotus"
          className="mb-10"
        />

        <div className="w-full overflow-hidden bg-white shadow-[0_8px_32px_rgba(212,84,126,0.08)]">
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.question}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
