import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';
import spaFacial from '@/assets/spa_facial.png';
import spaMassage from '@/assets/spa_massage.png';
import spaProducts from '@/assets/spa_products.png';
import spaAbout from '@/assets/spa_about.png';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Đoá Khai Minh",
    duration: "90 phút",
    desc: "Bạn ngửi thấy hương sả ấm áp, cảm nhận những đường ấn sâu dài chạy dọc sống lưng. Nhịp thở chậm dần hòa cùng chuyển động.",
    img: spaFacial
  },
  {
    title: "Chạm Phù Sa",
    duration: "75 phút",
    desc: "Hơi mát của khoáng sét ôm lấy da mặt. Cơ mặt hoàn toàn thả lỏng khi từng lớp mặt nạ làm dịu đi những dấu vết mệt mỏi.",
    img: spaMassage
  },
  {
    title: "Vụ Mùa Ngơi Nghỉ",
    duration: "60 phút",
    desc: "Đôi chân ngâm trong nước muối hồng và cánh sen, bạn nghe tiếng lá khô lạo xạo. Mọi mỏi mệt được rũ bỏ qua từng huyệt đạo.",
    img: spaProducts
  },
  {
    title: "Vũ Điệu Sếu Đỏ",
    duration: "120 phút",
    desc: "Liệu trình chữ lành sâu kết hợp kỹ thuật vươn vai mềm mại và năng lượng từ đá muối, mô phỏng sự vươn mình của loài sếu.",
    img: spaAbout
  }
];

export const ServicesStickyStack = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    
    return () => ctx.revert();
  }, [reduce]);

  return (
    <Section id="lieu-trinh" className="bg-lotus-foreground p-0 m-0">
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <Eyebrow className="mb-4 block text-lotus-secondary">Tuyển Tập Dịch Vụ</Eyebrow>
        <Heading className="text-white">Những Cuộc Gặp Gỡ Của Cơ Thể</Heading>
      </div>

      <div ref={ref} className="relative w-full">
        {services.map((svc, i) => (
          <div
            key={i}
            className={`stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center w-full px-6 md:px-12 ${i % 2 === 0 ? "bg-white" : "bg-lotus-background"}`}
          >
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center pt-20 pb-12">
              <div className={`order-2 ${i % 2 !== 0 ? "md:order-1" : ""}`.trim()}>
                <Eyebrow className="mb-4 block">{svc.duration}</Eyebrow>
                <Heading as="h3" className="mb-6">{svc.title}</Heading>
                <Body className="max-w-md">{svc.desc}</Body>
              </div>
              <div className={`order-1 h-[40vh] md:h-[70vh] rounded-2xl overflow-hidden ${i % 2 !== 0 ? "md:order-2" : ""}`.trim()}>
                <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
