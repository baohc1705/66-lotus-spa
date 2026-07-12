import { useState } from "react";
import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";

const STEPS = [
  {
    title: "Đón tiếp",
    subtitle: "Arrival",
    description:
      "Trà thảo mộc thơm lành và khăn ấm mát lạnh chào đón bạn — bước đầu để rũ bỏ cát bụi và lo toan.",
  },
  {
    title: "Tham vấn",
    subtitle: "Consultation",
    description:
      "Chuyên viên lắng nghe trạng thái sức khỏe, mong muốn và kiểm tra cơ thể để tư vấn liệu trình phù hợp.",
  },
  {
    title: "Trị liệu",
    subtitle: "Treatment",
    description:
      "Kỹ thuật massage điêu luyện kết hợp dược thảo tự nhiên trong phòng riêng ấm cúng, riêng tư.",
  },
  {
    title: "Thư giãn",
    subtitle: "Relaxation",
    description:
      "Thưởng trà, dùng cháo sen bổ dưỡng và nghỉ ngơi sâu tại sảnh chờ tràn hương thơm dịu nhẹ.",
  },
  {
    title: "Chăm sóc sau",
    subtitle: "Aftercare",
    description:
      "Hướng dẫn bài tập thở, chế độ sinh hoạt và theo dõi tiến trình phục hồi sau liệu trình.",
  },
];

export const ProcessTimeline = () => {
  const [active, setActive] = useState(0);

  return (
    <section
      id="process"
      className="landing-section bg-page"
      aria-labelledby="process-heading"
    >
      <div className="landing-container">
        <SectionHeader
          label="Trải nghiệm"
          title="Hành trình phục hồi"
          titleId="process-heading"
          description="Chu trình khép kín được thiết kế để chăm sóc trọn vẹn thân — tâm — trí từ lúc bạn đặt chân đến."
          align="split"
          className="mb-16"
        />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <nav
            className="lg:col-span-5"
            aria-label="Các bước trải nghiệm spa"
          >
            <ol className="space-y-2">
              {STEPS.map((step, i) => {
                const isActive = active === i;
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={isActive ? "step" : undefined}
                      className={`landing-focus-ring w-full border px-5 py-4 text-left transition-all duration-200 ${
                        isActive
                          ? "border-rose-600/20 bg-white shadow-[0_4px_20px_rgba(42,31,26,0.06)]"
                          : "border-transparent bg-transparent hover:border-rose-600/10 hover:bg-white/60"
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          className={`font-geist text-xs font-medium tabular-nums ${
                            isActive ? "text-rose-600" : "text-warm-600"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="block font-geist text-base font-semibold text-ink">
                            {step.title}
                          </span>
                          <span className="font-geist text-xs text-warm-600">
                            {step.subtitle}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <motion.div
            key={active}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="landing-surface flex flex-col justify-center p-8 md:p-10 lg:col-span-7"
            aria-live="polite"
          >
            <span className="mb-4 font-geist text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">
              Bước {String(active + 1).padStart(2, "0")}
            </span>
            <h3 className="mb-3 font-geist text-display-section-sm font-semibold tracking-[-0.02em] text-ink">
              {STEPS[active].title}
            </h3>
            <p className="max-w-prose font-geist text-base leading-[1.7] text-warm-600">
              {STEPS[active].description}
            </p>

            <div className="mt-8 flex gap-1.5" aria-hidden="true">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= active ? "w-8 bg-rose-600" : "w-3 bg-rose-600/15"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
