import { Navbar }              from '@/features/landing/components/Navbar'
import { HeroSection }         from '@/features/landing/components/HeroSection'
import { BrandIntroSection }   from '@/features/landing/components/BrandIntroSection'
import { ServicesSection }     from '@/features/landing/components/ServicesSection'
import { SpaceGallerySection } from '@/features/landing/components/SpaceGallerySection'
import { ProductsSection }     from '@/features/landing/components/ProductsSection'
import { ProcessTimeline }     from '@/features/landing/components/ProcessTimeline'
import { TestimonialsSection } from '@/features/landing/components/TestimonialsSection'
import { QuizSection }         from '@/features/landing/components/QuizSection'
import { LocationSection }     from '@/features/landing/components/LocationSection'
import { BookingSection }      from '@/features/landing/components/BookingSection'
import { FooterSection }       from '@/features/landing/components/FooterSection'

export const HomePage = () => (
  <main className="bg-lotus-cream">
    <Navbar />
    <HeroSection />
    <BrandIntroSection />
    <ServicesSection />
    <SpaceGallerySection />
    <ProductsSection />
    <ProcessTimeline />
    <TestimonialsSection />
    <QuizSection />
    <LocationSection />
    <BookingSection />
    <FooterSection />
  </main>
)
