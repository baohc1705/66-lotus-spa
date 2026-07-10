import { motion } from "motion/react";
import { Eye, ShoppingBag } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

import spaProducts from "@/assets/spa_products.png";
import spaFacial from "@/assets/spa_facial.png";
import spaTreatment from "@/assets/spa_treatment_1780310830592.png";
import spaAbout from "@/assets/spa_about.png";

const PRODUCTS = [
  {
    name: "Tinh dầu Hoa Sen",
    price: "350.000đ",
    tag: "Bán chạy",
    description:
      "Chiết xuất 100% từ hoa sen tự nhiên, thư giãn và cân bằng tinh thần.",
    imageSrc: spaProducts,
    imageAlt: "Tinh dầu hoa sen tự nhiên",
  },
  {
    name: "Kem dưỡng da sen",
    price: "280.000đ",
    tag: "Dưỡng ẩm",
    description:
      "Dưỡng ẩm sâu với chiết xuất sen, giúp da mềm mịn và sáng khỏe mỗi ngày.",
    imageSrc: spaFacial,
    imageAlt: "Kem dưỡng da chiết xuất sen",
  },
  {
    name: "Bộ chăm sóc da",
    price: "680.000đ",
    tag: "Combo tiết kiệm",
    description:
      "Combo đầy đủ bước chăm sóc da, tiết kiệm hơn khi mua lẻ từng sản phẩm.",
    imageSrc: spaTreatment,
    imageAlt: "Bộ sản phẩm chăm sóc da",
  },
  {
    name: "Serum sen hồng",
    price: "420.000đ",
    tag: "Mới",
    description:
      "Serum sen hồng Đồng Tháp, phục hồi và làm dịu làn da nhạy cảm.",
    imageSrc: spaAbout,
    imageAlt: "Serum sen hồng Đồng Tháp",
  },
];

export const ProductsSection = () => {
  return (
    <section
      id="products"
      className="landing-section bg-lotus-cream"
      aria-labelledby="products-heading"
    >
      <div className="landing-container">
        <SectionHeader
          title="Sản phẩm"
          titleId="products-heading"
          variant="lotus"
          className="mb-10"
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <motion.article
              key={product.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="group flex flex-col overflow-hidden bg-white shadow-[0_2px_14px_rgba(42,31,26,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(212,84,126,0.22)]"
            >
              {/* Ảnh */}
              <div className="relative aspect-[5/4] overflow-hidden bg-lotus-rose-light/40">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />

                <span className="absolute left-2.5 top-2.5 bg-white px-2 py-1 font-geist text-xs font-medium text-lotus-rose shadow-sm">
                  {product.tag}
                </span>

                {/* Overlay hover: xem chi tiết */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(42,31,26,0.45)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md">
                    <Eye className="h-5 w-5 text-lotus-deep" aria-hidden="true" />
                  </span>
                  <span className="font-geist text-sm font-medium text-white">
                    Xem chi tiết
                  </span>
                </div>
              </div>

              {/* Nội dung */}
              <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                <h3 className="mb-1.5 font-geist text-base font-semibold leading-snug text-lotus-deep sm:text-base">
                  {product.name}
                </h3>

                <p className="mb-3 line-clamp-2 font-geist text-sm leading-[1.5] text-lotus-stone">
                  {product.description}
                </p>

                <p className="mb-3 font-geist text-base font-bold tabular-nums text-lotus-rose">
                  {product.price}
                </p>

                <div
                  className="mb-3 h-px w-full bg-lotus-deep/10"
                  aria-hidden="true"
                />

                {/* Mua ngay: text → nút hồng khi hover */}
                <a
                  href="/dat-lich"
                  className="landing-focus-ring mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 font-geist text-sm font-medium text-lotus-rose transition-all duration-300 group-hover:bg-lotus-rose group-hover:text-white group-hover:hover:bg-lotus-rose-dark"
                >
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                  Mua ngay
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
