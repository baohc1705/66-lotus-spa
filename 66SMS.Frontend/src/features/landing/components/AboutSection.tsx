import { useState } from "react";
import { motion } from "motion/react";
import aboutBg from "@/assets/backgrounds/about.webp";
import spaAbout from "@/assets/spa_about.png";
import { LotusDivider } from "./LotusDivider";

const SLIDES = [
  {
    subtitle: "Đơn vị tiên phong về dịch vụ Spa",
    description:
      "Hoa Sen Spa mang đến không gian thư giãn chuẩn 5 sao với liệu trình chăm sóc từ thiên nhiên. Đội ngũ kỹ thuật viên giàu kinh nghiệm, sản phẩm cao cấp và dịch vụ tận tâm giúp bạn tái tạo năng lượng mỗi ngày.",
  },
  {
    subtitle: "Liệu trình từ sen Đồng Tháp",
    description:
      "Chúng tôi chọn nguyên liệu sen tự nhiên, kết hợp kỹ thuật trị liệu nhẹ nhàng để mang lại cảm giác thư thái sâu — từ làn da đến tinh thần.",
  },
  {
    subtitle: "Không gian chuẩn thư giãn",
    description:
      "Mỗi phòng được thiết kế ấm áp, riêng tư với hương thơm dịu và ánh sáng mềm, giúp bạn tạm gác lại nhịp sống hối hả và trở về với chính mình.",
  },
  {
    subtitle: "Đội ngũ kỹ thuật viên tâm huyết",
    description:
      "Kỹ thuật viên được đào tạo bài bản, lắng nghe nhu cầu của bạn để cá nhân hóa liệu trình — chăm sóc đúng chỗ, đúng lúc, đúng người.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export const AboutSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = SLIDES[activeSlide];

  return (
    <section
      id="about"
      className="relative w-full overflow-hidden"
      aria-labelledby="about-heading"
    >
      <div className="grid w-full lg:grid-cols-2">
        {/* Trái: nội dung */}
        <motion.div
          className="relative flex min-h-[420px] flex-col justify-center bg-rose-600 px-8 py-12 sm:px-12 sm:py-14 lg:min-h-[560px] lg:px-16 lg:py-20 xl:px-24"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${aboutBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
            <h2
              id="about-heading"
              className="font-display text-display-section-md font-semibold leading-[1.15] tracking-[0.02em] text-white"
            >
              Tại sao chọn Sen Spa
            </h2>

            <LotusDivider
              dark
              className="mt-4 justify-center lg:justify-start"
            />

            <h3 className="mt-6 font-geist text-lg font-semibold text-white sm:text-xl">
              {slide.subtitle}
            </h3>

            <p className="mt-4 font-geist text-base leading-[1.75] text-white/90">
              {slide.description}
            </p>

            <div
              className="mt-10 flex items-center justify-center gap-3 lg:justify-start"
              role="tablist"
              aria-label="Các lý do chọn Sen Spa"
            >
              {SLIDES.map((item, index) => {
                const isActive = index === activeSlide;
                return (
                  <button
                    key={item.subtitle}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`landing-focus-ring flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300 ${
                      isActive
                        ? "border-white"
                        : "border-transparent hover:border-white/40"
                    }`}
                  >
                    <span
                      className={`rounded-full bg-white transition-all duration-300 ${
                        isActive ? "h-1.5 w-1.5" : "h-1.5 w-1.5 opacity-55"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Phải: ảnh — chỉ motion khi load */}
        <motion.div
          className="relative min-h-[320px] lg:min-h-[560px]"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.08, ease }}
        >
          <img
            src={spaAbout}
            alt="Không gian và liệu trình thư giãn tại Hoa Sen Spa"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
