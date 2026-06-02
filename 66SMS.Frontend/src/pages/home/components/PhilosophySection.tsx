import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';

export const PhilosophySection = () => {
  return (
    <Section id="triet-ly" className="bg-lotus-background relative">
      <div className="mb-16 md:mb-24 text-center">
        <Eyebrow className="mb-4 block">Triết Lý Của Chúng Tôi</Eyebrow>
        <Heading className="max-w-2xl mx-auto">
          Tôn trọng nhịp điệu tự nhiên của cơ thể
        </Heading>
      </div>

      {/* Broken Grid 2+2 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1 (Large, spans 7 cols on desktop) */}
        <div className="md:col-span-7 bg-white p-8 md:p-12 rounded-lg border border-lotus-muted shadow-sm hover:shadow-md transition-shadow duration-300">
          <Eyebrow className="mb-4 block">Kỹ Thuật</Eyebrow>
          <Heading as="h3" className="text-2xl md:text-3xl mb-4">Chạm như một hình thức lắng nghe</Heading>
          <Body>
            Chúng tôi tin rằng đôi tay có ngôn ngữ riêng để thấu hiểu sự căng thẳng thầm lặng. Mỗi liệu pháp không chỉ là xoa bóp, mà là một cuộc đối thoại tinh tế giữa người trị liệu và nhịp thở của bạn.
          </Body>
        </div>

        {/* Card 2 (Small, spans 5 cols) */}
        <div className="md:col-span-5 bg-white p-8 md:p-10 rounded-lg border border-lotus-muted shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-center">
          <Eyebrow className="mb-4 block">Nguyên Liệu</Eyebrow>
          <Heading as="h3" className="text-2xl md:text-3xl mb-4">Thảo mộc từ Đồng Tháp</Heading>
          <Body>
            Từ ngó sen, củ ấu cho đến lá sả dại, tất cả đều mang hơi thở của đất bùn sông Mekong. Chúng tôi ưu tiên nguyên liệu bản địa, thu hoạch theo mùa để bảo toàn dược tính tự nhiên.
          </Body>
        </div>

        {/* Card 3 (Small, spans 5 cols) */}
        <div className="md:col-span-5 bg-white p-8 md:p-10 rounded-lg border border-lotus-muted shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-center">
          <Eyebrow className="mb-4 block">Không Gian</Eyebrow>
          <Heading as="h3" className="text-2xl md:text-3xl mb-4">Tĩnh lặng là sự xa xỉ</Heading>
          <Body>
            Chúng tôi tước bỏ những âm thanh điện tử và sự trang trí thừa thãi. Không gian được thiết kế dựa trên nguyên lý triệt tiêu tiếng ồn, để lại tiếng nước chảy và âm thanh của tĩnh lặng.
          </Body>
        </div>

        {/* Card 4 (Large, spans 7 cols) */}
        <div className="md:col-span-7 bg-white p-8 md:p-12 rounded-lg border border-lotus-muted shadow-sm hover:shadow-md transition-shadow duration-300">
          <Eyebrow className="mb-4 block">Thái Độ</Eyebrow>
          <Heading as="h3" className="text-2xl md:text-3xl mb-4">Nghi lễ hơn là thói quen</Heading>
          <Body>
            Đến với Hoa Sen Spa không phải là một giao dịch dịch vụ nhanh chóng. Mỗi bước từ lúc cởi giày, thưởng trà đến khi khép mắt lại là một phần của buổi lễ thanh tẩy tâm trí.
          </Body>
        </div>

      </div>
    </Section>
  );
};
