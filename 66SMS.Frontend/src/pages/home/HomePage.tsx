import React from 'react';
import { Navbar }             from './components/Navbar';
import { HeroSection }        from './components/HeroSection';
import { StatsBar }           from './components/StatsBar';
import { ServicesSection }    from './components/ServicesSection';
import { PromoBanner }        from './components/PromoBanner';
import { AboutSection }       from './components/AboutSection';
import { ProductsSection }    from './components/ProductsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BookingCTASection }  from './components/BookingCTASection';
import { FooterSection }      from './components/FooterSection';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-lotus-background text-lotus-foreground font-sans">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <PromoBanner />
      <AboutSection />
      <ProductsSection />
      <TestimonialsSection />
      <BookingCTASection />
      <FooterSection />
    </div>
  );
};
