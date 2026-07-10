import { Navbar } from "@/features/landing/components/Navbar";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { TrustedByStrip } from "@/features/landing/components/TrustedByStrip";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { ServicesSection } from "@/features/landing/components/ServicesSection";
import { ProductsSection } from "@/features/landing/components/ProductsSection";
import { SpaceGallerySection } from "@/features/landing/components/SpaceGallerySection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { FaqSection } from "@/features/landing/components/FaqSection";
import { BookingCtaSection } from "@/features/landing/components/BookingCtaSection";
import { FooterSection } from "@/features/landing/components/FooterSection";
import { MotionConfig } from "motion/react";

export const HomePage = () => (
  <MotionConfig reducedMotion="user">
    <main className="landing-page bg-lotus-cream font-geist">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:focus:bg-lotus-deep focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua đến nội dung chính
      </a>
      <Navbar />
      <HeroSection />
      <TrustedByStrip />
      <AboutSection />
      <ServicesSection />
      <ProductsSection />
      <SpaceGallerySection />
      <TestimonialsSection />
      <FaqSection />
      <BookingCtaSection />
      <FooterSection />
    </main>
  </MotionConfig>
);
