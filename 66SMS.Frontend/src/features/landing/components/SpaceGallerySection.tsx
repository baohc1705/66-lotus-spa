import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";
import spaAbout from "@/assets/spa_about.png";
import spaFacial from "@/assets/spa_facial.png";
import spaMassage from "@/assets/spa_massage.png";
import spaTreatment from "@/assets/spa_treatment_1780310830592.png";
import spaHero from "@/assets/spa_hero.png";
import spaProducts from "@/assets/spa_products.png";

const GALLERY = [
  {
    src: spaAbout,
    alt: "Phòng massage riêng tư tại Hoa Sen Spa",
    featured: true,
  },
  {
    src: spaFacial,
    alt: "Phòng chăm sóc da mặt",
  },
  {
    src: spaTreatment,
    alt: "Phòng body treatment",
  },
  {
    src: spaMassage,
    alt: "Phòng thư giãn cao cấp",
  },
  {
    src: spaHero,
    alt: "Sảnh tiếp đón",
  },
  {
    src: spaProducts,
    alt: "Khu trưng bày sản phẩm",
  },
];

export const SpaceGallerySection = () => {
  const featured = GALLERY.find((item) => item.featured) ?? GALLERY[0];
  const sideImages = GALLERY.filter((item) => item !== featured);

  return (
    <section
      id="space"
      className="landing-section bg-ink"
      aria-labelledby="space-heading"
    >
      <div className="landing-container">
        <SectionHeader
          title="Phòng riêng"
          titleId="space-heading"
          dark
          variant="lotus"
          className="mb-8"
        />

        {/*
          Layout 3 cột × 3 hàng:
          [ ẢNH CHÍNH 2×2 ] [ phụ ]
          [               ] [ phụ ]
          [ phụ ] [ phụ ] [ phụ ]
        */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:grid-rows-[140px_140px_140px] lg:grid-rows-[160px_160px_160px]">
          {/* Ảnh chính nổi bật */}
          <motion.figure
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4 }}
            className="group relative col-span-2 row-span-2 overflow-hidden"
          >
            <img
              src={featured.src}
              alt={featured.alt}
              loading="lazy"
              className="h-full min-h-[220px] w-full object-cover md:min-h-0"
            />
          </motion.figure>

          {/* Ảnh phụ */}
          {sideImages.map((item, i) => (
            <motion.figure
              key={item.alt}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.35, delay: 0.06 + i * 0.04 }}
              className="group relative overflow-hidden"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full min-h-[100px] w-full object-cover md:min-h-0"
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
