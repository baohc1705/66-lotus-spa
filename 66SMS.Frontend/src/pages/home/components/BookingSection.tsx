import React from 'react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';
import { ArrowRight } from 'lucide-react';
import heroCrane from '@/assets/spa_hero.png';

export const BookingSection = () => {
  return (
    <Section id="dat-lich" className="bg-lotus-foreground text-white py-24 md:py-32 relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-10">
         <img src={heroCrane} alt="" className="w-full h-full object-cover grayscale" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
        
        {/* Left Column: Value Prop */}
        <div>
          <Eyebrow className="mb-6 block text-lotus-secondary">Khởi Đầu Hành Trình</Eyebrow>
          <Heading className="mb-8 text-white max-w-sm">Dành Cho Bạn Một Khoảng Lặng.</Heading>
          <Body className="text-white/70 max-w-md">
            Một chuyên viên sẽ liên hệ lại trong vòng 2 giờ để lắng nghe cơ thể bạn cần gì và chuẩn bị không gian phù hợp nhất.
          </Body>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-sans font-medium text-lotus-foreground">Họ Tên</label>
              <input 
                type="text" 
                id="name" 
                className="w-full bg-lotus-background/50 border border-lotus-muted px-4 py-3 outline-none focus:border-lotus-primary focus:ring-1 focus:ring-lotus-primary transition-colors text-lotus-foreground rounded-lg"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-sans font-medium text-lotus-foreground">Số Điện Thoại</label>
              <input 
                type="tel" 
                id="phone" 
                className="w-full bg-lotus-background/50 border border-lotus-muted px-4 py-3 outline-none focus:border-lotus-primary focus:ring-1 focus:ring-lotus-primary transition-colors text-lotus-foreground rounded-lg"
                required 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="treatment" className="block text-sm font-sans font-medium text-lotus-foreground">Liệu Trình Quan Tâm</label>
              <select 
                id="treatment" 
                className="w-full bg-lotus-background/50 border border-lotus-muted px-4 py-3 outline-none focus:border-lotus-primary focus:ring-1 focus:ring-lotus-primary transition-colors text-lotus-foreground rounded-lg"
              >
                <option value="">Chọn liệu trình...</option>
                <option value="khai-minh">Đoá Khai Minh (90p)</option>
                <option value="phu-sa">Chạm Phù Sa (75p)</option>
                <option value="mua-mang">Vụ Mùa Ngơi Nghỉ (60p)</option>
                <option value="hoang-hon">Vũ Điệu Sếu Đỏ (120p)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-3 bg-lotus-primary text-white rounded-lg py-4 font-sans font-medium tracking-wide hover:bg-lotus-primary/90 transition-colors mt-8"
            >
              Xác Nhận Đặt Lịch
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </Section>
  );
};
