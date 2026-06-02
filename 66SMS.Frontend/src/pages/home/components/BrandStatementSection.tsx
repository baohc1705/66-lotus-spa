import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Quote, Body } from '@/shared/components/ui/Typography';

export const BrandStatementSection = () => {
  return (
    <Section className="bg-lotus-background" containerClass="max-w-[680px] mx-auto text-center">
      <Quote className="mb-10 text-2xl md:text-3xl lg:text-4xl">
        "Mỗi mùa lũ về Đồng Tháp, mùi hương tinh khiết của bùn và sen nở rộ nhắc nhở chúng tôi về cội nguồn của sự tĩnh lặng. Hoa Sen Spa ra đời không phải như một cơ sở làm đẹp, mà là một hành động bảo tồn cá nhân để mang sự tĩnh lặng nguyên sơ ấy vào chốn thị thành."
      </Quote>
      
      <div className="space-y-6 text-left max-w-[600px] mx-auto">
        <Body>
          Chúng tôi lớn lên giữa những cánh đồng sen ngập nước, nơi mỗi bình minh là một nghi thức chậm rãi của sương và hương thơm. Trong thế giới đô thị vội vã hiện tại, chúng tôi nhận ra điều xa xỉ nhất không phải là sự hào nhoáng, mà là một khoảng không gian để thở, để lắng nghe cơ thể.
        </Body>
        <Body>
          Bởi vậy, mọi chi tiết tại đây đều là chủ ý. Từ vật liệu thô mộc, ánh sáng dịu nhẹ đến những thảo dược bản địa được nâng niu. Tất cả nhằm tạo ra một vương quốc nhỏ, nơi bạn có thể rũ bỏ lớp vỏ mệt mỏi và trở về với nguyên bản của chính mình.
        </Body>
      </div>
    </Section>
  );
};
