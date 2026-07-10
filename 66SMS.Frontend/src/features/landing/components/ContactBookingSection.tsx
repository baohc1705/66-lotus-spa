import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { Button } from "./Button";
import { SectionHeader } from "./SectionHeader";

export const ContactBookingSection = () => {
  return (
    <section id="booking" className="landing-section bg-lotus-cream" aria-labelledby="booking-heading">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="mb-14 overflow-hidden border border-lotus-rose/12 bg-lotus-deep px-6 py-10 md:px-10 md:py-12"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl text-left">
              <span className="mb-3 block font-geist text-xs font-medium uppercase tracking-[0.18em] text-lotus-gold">
                Sẵn sàng thư giãn?
              </span>
              <h2
                id="booking-heading"
                className="font-geist text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white"
              >
                Đặt lịch hôm nay — chỉ mất 2 phút
              </h2>
              <p className="mt-4 max-w-md font-geist text-base leading-[1.65] text-white/65">
                Chọn dịch vụ và khung giờ phù hợp. Chúng tôi xác nhận qua điện thoại trong vòng 2 giờ làm việc.
              </p>
            </div>
            <a
              href="#booking"
              className="landing-focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-geist text-sm font-medium text-lotus-deep transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Bắt đầu đặt lịch <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            id="booking-form"
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
          >
            <SectionHeader
              label="Đặt lịch"
              title="Điền thông tin liên hệ"
              description="Mọi trường có dấu * là bắt buộc. Thông tin của bạn được bảo mật."
              className="mb-8"
            />
            <BookingForm />
          </motion.div>

          <motion.aside
            className="landing-surface flex flex-col p-6 md:p-8 lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            aria-label="Thông tin chi nhánh"
          >
            <h3 className="mb-6 font-geist text-lg font-semibold text-lotus-deep">
              Chi nhánh Cao Lãnh
            </h3>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-lotus-rose" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <span className="block font-geist text-xs font-semibold text-lotus-deep">Địa chỉ</span>
                  <span className="font-geist text-sm text-lotus-stone">
                    123 Đường Lê Lợi, TP. Cao Lãnh, Đồng Tháp
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-lotus-rose" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <span className="block font-geist text-xs font-semibold text-lotus-deep">Điện thoại</span>
                  <a
                    href="tel:0907959395"
                    className="landing-focus-ring font-geist text-sm text-lotus-stone transition-colors hover:text-lotus-rose"
                  >
                    0907 95 93 95
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-lotus-rose" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <span className="block font-geist text-xs font-semibold text-lotus-deep">Giờ mở cửa</span>
                  <span className="font-geist text-sm text-lotus-stone">
                    8:00 – 21:00, Thứ 2 – Chủ nhật
                  </span>
                </div>
              </li>
            </ul>

            <div className="mt-8 overflow-hidden border border-lotus-rose/10">
              <iframe
                title="Bản đồ Hoa Sen Spa — Cao Lãnh, Đồng Tháp"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.8!2d105.63!3d10.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI3JzAwLjAiTiAxMDXCsDM3JzQ4LjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[200px] w-full"
              />
            </div>

            <Button
              href="https://maps.google.com"
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-fit px-5 py-2.5 text-xs"
            >
              Chỉ đường <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </motion.aside>
        </div>
      </div>
    </section>
  );
};
