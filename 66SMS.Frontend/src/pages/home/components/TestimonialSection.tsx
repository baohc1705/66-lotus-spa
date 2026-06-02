import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';

export const TestimonialSection = () => {
  return (
    <Section className="bg-lotus-dust">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <Eyebrow className="mb-4 block">Ghi Chép Lại</Eyebrow>
        <Heading>Từ những người đã ghé thăm</Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
        {/* Testimonial 1 - Largest, Left Col */}
        <div className="md:col-span-7 md:mt-0">
          <blockquote className="font-serif italic text-2xl md:text-3xl text-lotus-primary leading-relaxed">
            "Trong lúc nằm nghe tiếng giọt nước rơi ở phòng chờ, tôi nhận ra mình đã ngừng suy nghĩ về những lịch trình dang dở. Điều còn sót lại chỉ là cảm giác an toàn kỳ lạ, giống như được trở về nhà sau một chuyến đi dài."
          </blockquote>
          <Eyebrow className="mt-6 block text-lotus-foreground opacity-80">TỪ L. ANH</Eyebrow>
        </div>

        {/* Testimonial 2 - Medium, Right Col */}
        <div className="md:col-span-5 md:mt-32">
          <blockquote className="font-serif italic text-xl md:text-2xl text-lotus-foreground leading-relaxed">
            "Không có tiếng nhạc thiền công nghiệp, không có lời hứa hẹn. Chỉ có mùi hương bùn ngái ngái và một đôi tay dường như hiểu rõ mọi sự mỏi mệt mà tôi đã giấu đi."
          </blockquote>
          <Eyebrow className="mt-4 block text-lotus-muted-foreground opacity-80">TỪ P. MINH</Eyebrow>
        </div>

        {/* Testimonial 3 - Smallest, Center-ish (Spans middle columns) */}
        <div className="md:col-span-8 md:col-start-3 md:mt-16 text-center">
          <blockquote className="font-serif italic text-lg md:text-xl text-lotus-foreground/80 leading-relaxed">
            "Lần đầu tiên sau nhiều năm, tôi thực sự ngủ quên trong một buổi trị liệu. Khi tỉnh dậy, cả cơ thể nhẹ bẫng và trong đầu là một khoảng trống bình yên hiếm hoi."
          </blockquote>
          <Eyebrow className="mt-4 block text-lotus-muted-foreground opacity-80">TỪ H. TRANG</Eyebrow>
        </div>
      </div>
    </Section>
  );
};
