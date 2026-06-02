import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';
import spaProducts from '@/assets/spa_products.png';
import spaFacial from '@/assets/spa_facial.png';
import spaAbout from '@/assets/spa_about.png';

export const EditorialSection = () => {
  return (
    <Section className="bg-lotus-background">
      <div className="mb-12 md:mb-20">
        <Eyebrow className="mb-4 block">Từ Góc Nhìn Của Chúng Tôi</Eyebrow>
        <Heading>Ghi Chép Về Đời Sống</Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
        
        {/* Large Article (Spans 7 cols on Desktop) */}
        <div className="md:col-span-7 group cursor-pointer flex flex-col h-full">
          <div className="overflow-hidden aspect-[4/3] md:aspect-[3/2] mb-6">
            <img 
              src={spaProducts} 
              alt="Ý nghĩa văn hóa của hoa sen" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          <Eyebrow className="mb-3 block text-lotus-foreground opacity-60">12 THÁNG 5, 2025</Eyebrow>
          <Heading as="h3" className="text-2xl md:text-3xl mb-4 group-hover:text-lotus-primary transition-colors">
            Hoa Sen: Khi Tính Bản Địa Trở Thành Phương Thuốc Chữa Lành
          </Heading>
          <Body className="mb-6 flex-1">
            Không chỉ là biểu tượng của sự thuần khiết, những thành phần từ hoa sen, từ ngó, tâm đến cánh hoa, đều chứa đựng đặc tính làm dịu tâm trí sâu sắc mà người Việt đã ứng dụng hàng thế kỷ qua.
          </Body>
          <span className="font-mono text-xs uppercase tracking-widest text-lotus-accent group-hover:text-lotus-primary transition-colors flex items-center gap-2 mt-auto">
            Đọc thêm <span className="text-lg">→</span>
          </span>
        </div>

        {/* Small Articles (Spans 5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-8 md:gap-12">
          
          {/* Article 2 */}
          <div className="group cursor-pointer flex flex-col sm:flex-row md:flex-col gap-6">
            <div className="w-full sm:w-1/2 md:w-full overflow-hidden aspect-[16/9] md:aspect-[4/3] shrink-0">
              <img 
                src={spaFacial} 
                alt="Thảo mộc bản địa" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div>
              <Eyebrow className="mb-2 block text-lotus-foreground opacity-60">05 THÁNG 5, 2025</Eyebrow>
              <Heading as="h4" className="text-xl md:text-2xl mb-3 group-hover:text-lotus-primary transition-colors">
                Hương Bùn Và Trí Nhớ Của Đất
              </Heading>
              <Body className="text-sm line-clamp-2 mb-4">
                Khám phá sức mạnh thanh lọc của khoáng sét phù sa sông Mekong, nguyên liệu cốt lõi trong liệu trình chăm sóc da đặc trưng.
              </Body>
              <span className="font-mono text-xs uppercase tracking-widest text-lotus-accent group-hover:text-lotus-primary transition-colors flex items-center gap-2">
                Đọc thêm <span className="text-lg">→</span>
              </span>
            </div>
          </div>

          {/* Article 3 */}
          <div className="group cursor-pointer flex flex-col sm:flex-row md:flex-col gap-6">
            <div className="w-full sm:w-1/2 md:w-full overflow-hidden aspect-[16/9] md:aspect-[4/3] shrink-0">
              <img 
                src={spaAbout} 
                alt="Sức khỏe tinh thần" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div>
              <Eyebrow className="mb-2 block text-lotus-foreground opacity-60">28 THÁNG 4, 2025</Eyebrow>
              <Heading as="h4" className="text-xl md:text-2xl mb-3 group-hover:text-lotus-primary transition-colors">
                Nghệ Thuật Của Việc Không Làm Gì Cả
              </Heading>
              <Body className="text-sm line-clamp-2 mb-4">
                Vì sao đôi khi sự can thiệp tốt nhất lại là tạo ra một khoảng không gian trống để cơ thể tự tìm về trạng thái cân bằng.
              </Body>
              <span className="font-mono text-xs uppercase tracking-widest text-lotus-accent group-hover:text-lotus-primary transition-colors flex items-center gap-2">
                Đọc thêm <span className="text-lg">→</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </Section>
  );
};
