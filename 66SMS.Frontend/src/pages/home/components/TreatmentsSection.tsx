import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';
import { cn } from '@/lib/utils';
import spaFacial from '@/assets/spa_facial.png';
import spaMassage from '@/assets/spa_massage.png';
import spaProducts from '@/assets/spa_products.png';
import spaAbout from '@/assets/spa_about.png';

interface TreatmentProps {
  title: string;
  duration: string;
  description: string;
  price: string;
  imageUrl: string;
  isWide?: boolean;
}

const TreatmentCard = ({ title, duration, description, price, imageUrl, isWide = false }: TreatmentProps) => (
  <div className={cn(
    "flex-none flex flex-col snap-center group border border-lotus-muted bg-white transition-colors duration-500 hover:border-lotus-secondary",
    isWide ? "w-[85vw] md:w-[600px] aspect-[4/3] md:aspect-[16/9]" : "w-[75vw] md:w-[400px] aspect-[3/4] md:aspect-[3/4]"
  )}>
    <div className="flex-1 overflow-hidden">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
      />
    </div>
    <div className="p-6 md:p-8 flex flex-col justify-between flex-shrink-0 bg-white">
      <div>
        <Heading as="h4" className="text-2xl mb-2">{title}</Heading>
        <Body className="text-sm line-clamp-3 mb-4">{description}</Body>
      </div>
      <div className="flex justify-between items-center border-t border-lotus-muted pt-4 mt-auto">
        <Eyebrow>{duration}</Eyebrow>
        <Eyebrow className="text-lotus-foreground">{price}</Eyebrow>
      </div>
    </div>
  </div>
);

export const TreatmentsSection = () => {
  const treatments = [
    {
      title: "Đoá Khai Minh",
      duration: "90 phút",
      description: "Bạn ngửi thấy hương sả ấm áp, cảm nhận những đường ấn sâu dài chạy dọc sống lưng giải phóng những luồng cơ bị siết chặt. Nhịp thở chậm dần hòa cùng chuyển động nhịp nhàng.",
      price: "1,200,000 ₫",
      imageUrl: spaFacial,
      isWide: false
    },
    {
      title: "Chạm Phù Sa",
      duration: "75 phút",
      description: "Hơi mát của đất sét mịn ôm lấy da mặt, thoang thoảng mùi khoáng thô mộc. Cơ mặt hoàn toàn thả lỏng khi từng lớp mặt nạ làm dịu đi những dấu vết của mệt mỏi.",
      price: "950,000 ₫",
      imageUrl: spaMassage,
      isWide: true
    },
    {
      title: "Vụ Mùa Ngơi Nghỉ",
      duration: "60 phút",
      description: "Đôi chân ngâm trong nước muối hồng và sả ấm, bạn nghe tiếng lá khô lạo xạo. Cảm giác trọng lượng cơ thể được rũ bỏ khi những huyệt đạo ở lòng bàn chân được chạm đến.",
      price: "700,000 ₫",
      imageUrl: spaProducts,
      isWide: false
    },
    {
      title: "Hoàng Hôn Tĩnh Lặng",
      duration: "120 phút",
      description: "Cả không gian phủ trong ráng chiều mờ ảo. Hai người cùng chìm vào trải nghiệm tẩy tế bào chết bằng hạt sen xay nhuyễn và thư giãn sâu, nghe tiếng chuông xoay Tây Tạng vọng ngân.",
      price: "2,800,000 ₫",
      imageUrl: spaAbout,
      isWide: true
    }
  ];

  return (
    <Section id="lieu-trinh" fullWidth className="bg-white py-16 md:py-0 overflow-hidden">
      <div className="md:h-screen min-h-[600px] flex flex-col md:flex-row">
        {/* Sticky Header on Desktop */}
        <div className="w-full md:w-1/3 md:h-screen md:sticky md:top-0 p-6 md:p-16 lg:p-24 flex flex-col justify-center bg-lotus-background md:bg-transparent z-10 shrink-0">
          <Eyebrow className="mb-4 block">Tuyển Tập</Eyebrow>
          <Heading className="mb-6">Những Cuộc Gặp Gỡ Của Cơ Thể</Heading>
          <Body>
            Bốn liệu trình đặc trưng được thiết kế như những bài thơ ngắn, nơi bạn là người cảm nhận trực tiếp từng nốt hương và áp lực chạm.
          </Body>
        </div>

        {/* Scrollable Content */}
        <div className="w-full md:w-2/3 md:h-screen md:overflow-x-auto flex items-center md:pl-0 pl-6 pr-6 pb-8 md:pb-0 hide-scrollbar scroll-smooth">
          <div className="flex gap-6 md:gap-10 snap-x snap-mandatory overflow-x-auto w-full pt-8 md:pt-0 hide-scrollbar px-0 md:pr-24">
            {treatments.map((t, idx) => (
              <TreatmentCard key={idx} {...t} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
