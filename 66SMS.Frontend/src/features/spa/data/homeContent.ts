import { Award, Heart, Leaf, Shield, type LucideIcon } from "lucide-react";
import spaHero from "@/assets/spa_hero.png";
import spaFacial from "@/assets/spa_facial.png";
import spaMassage from "@/assets/spa_massage.png";
import spaProducts from "@/assets/spa_products.png";
import spaAbout from "@/assets/spa_about.png";

export const HOME_IMAGES = {
  hero: spaHero,
  facial: spaFacial,
  massage: spaMassage,
  products: spaProducts,
  about: spaAbout,
} as const;

export const SERVICES = [
  {
    image: spaFacial,
    title: "Chăm Sóc Da Mặt Chuyên Sâu",
    description:
      "Phục hồi làn da tươi trẻ, sáng mịn với công nghệ tiên tiến và tinh chất thiên nhiên cao cấp.",
    price: "350.000đ",
    badge: "Phổ biến nhất",
  },
  {
    image: spaMassage,
    title: "Massage Thư Giãn Toàn Thân",
    description:
      "Xoa tan mệt mỏi, khai thông khí huyết với liệu trình massage kết hợp tinh dầu thảo mộc quý.",
    price: "450.000đ",
    badge: "Mới",
  },
  {
    image: spaHero,
    title: "Trị Liệu Cơ Thể Tổng Thể",
    description:
      "Liệu trình kết hợp tẩy tế bào chết, đắp mặt nạ và dưỡng ẩm toàn thân cho làn da hoàn hảo.",
    price: "650.000đ",
  },
  {
    image: spaFacial,
    title: "Tắm Trắng Công Nghệ Cao",
    description:
      "Chuyên sâu làm sáng da với công nghệ nano đột phá, an toàn và hiệu quả rõ rệt sau lần đầu.",
    price: "550.000đ",
    badge: "Hot",
  },
] as const;

export const PRODUCTS = [
  {
    image: spaProducts,
    name: "Serum Dưỡng Sáng Vitamin C 30ml",
    category: "Dưỡng da",
    price: "280.000đ",
    originalPrice: "380.000đ",
    rating: 5,
  },
  {
    image: spaProducts,
    name: "Kem Dưỡng Ẩm Collagen Đêm 50g",
    category: "Chăm sóc da",
    price: "320.000đ",
    originalPrice: "420.000đ",
    rating: 5,
  },
  {
    image: spaProducts,
    name: "Toner Cân Bằng Da Hoa Hồng",
    category: "Làm sạch",
    price: "185.000đ",
    originalPrice: "230.000đ",
    rating: 4,
  },
  {
    image: spaProducts,
    name: "Mặt Nạ Đất Sét Thanh Lọc Da",
    category: "Mặt nạ",
    price: "150.000đ",
    rating: 5,
  },
] as const;

export const TESTIMONIALS = [
  {
    content:
      "SenSpa thực sự thay đổi cách tôi nhìn nhận về việc chăm sóc bản thân. Sau 3 buổi facial, làn da tôi sáng lên rõ rệt, các nếp nhăn cũng giảm đi nhiều. Đội ngũ kỹ thuật viên rất chuyên nghiệp!",
    name: "Nguyễn Thị Hương",
    role: "Giám đốc Kinh doanh",
    avatar: spaFacial,
    rating: 5,
  },
  {
    content:
      "Không gian yên tĩnh, nhân viên nhiệt tình và sản phẩm sử dụng đều là hàng cao cấp. Tôi đến đây mỗi tháng và không bao giờ thất vọng.",
    name: "Trần Minh Châu",
    role: "Giáo viên – Hà Nội",
    avatar: spaMassage,
    rating: 5,
  },
  {
    content:
      "Dịch vụ massage ở đây là tuyệt vời nhất tôi từng trải nghiệm. Giá cả hợp lý, booking online nhanh, đặc biệt nhân viên rất chu đáo.",
    name: "Phạm Lê Bảo",
    role: "Kỹ sư phần mềm",
    avatar: spaProducts,
    rating: 5,
  },
] as const;

export const STATS = [
  { value: "15+", label: "Năm kinh nghiệm" },
  { value: "50K+", label: "Khách hàng hài lòng" },
  { value: "200+", label: "Chuyên viên được đào tạo" },
  { value: "20+", label: "Chi nhánh toàn quốc" },
] as const;

export const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Award, title: "Công nghệ hiện đại", desc: "Máy móc và thiết bị nhập khẩu từ Hàn Quốc, Pháp và Mỹ." },
  { icon: Heart, title: "Sản phẩm organic", desc: "Chỉ sử dụng nguyên liệu thiên nhiên, lành tính, không hại da." },
  { icon: Leaf, title: "Thân thiện môi trường", desc: "Quy trình thân thiện với môi trường, đóng gói tái chế 100%." },
  { icon: Shield, title: "An toàn tuyệt đối", desc: "Cam kết tiêu chuẩn vệ sinh cao nhất, kiểm định định kỳ." },
];

export const NAV_LINKS = [
  { label: "Dịch vụ", href: "#dich-vu", hasDropdown: true },
  { label: "Sản phẩm", href: "#san-pham" },
  { label: "Về chúng tôi", href: "#ve-chung-toi" },
] as const;
