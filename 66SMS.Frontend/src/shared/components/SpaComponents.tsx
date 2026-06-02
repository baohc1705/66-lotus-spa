import React from 'react';
import { Eyebrow, Heading, Body } from './ui/Typography';

// ── Badge ─────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'highlight' | 'secondary' | 'white';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-lotus-primary text-white',
  highlight: 'bg-lotus-highlight/20 text-lotus-highlight',
  secondary: 'bg-lotus-secondary/20 text-lotus-primary',
  white: 'bg-white/20 text-white border border-white/30 backdrop-blur-sm',
};

const sizeStyles = {
  sm: 'text-xs px-2.5 py-1',
  md: 'text-xs px-3 py-1.5',
};

export function Badge({ children, variant = 'secondary', size = 'md', dot = false, className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans font-medium tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`.trim()}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────
interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={`space-y-4 ${align === 'center' ? 'text-center' : 'text-left'} ${className || ''}`.trim()}>
      {badge && <Badge variant={light ? 'white' : 'secondary'}>{badge}</Badge>}
      <Heading as="h2" className={light ? 'text-white' : undefined}>
        {title}
      </Heading>
      {subtitle && (
        <Body className={`max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-white/80' : 'text-lotus-foreground/70'}`.trim()}>
          {subtitle}
        </Body>
      )}
    </div>
  );
}

// ── ServiceCard ───────────────────────────────────────────────────────────
interface ServiceCardProps {
  image: string;
  title: string;
  description: string;
  price?: string;
  badge?: string;
  onBook?: () => void;
}

export function ServiceCard({ image, title, description, price, badge, onBook }: ServiceCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-lotus-muted/30">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {badge && (
          <div className="absolute top-4 left-4">
            <Badge variant="primary" size="sm">{badge}</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-lotus-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-medium text-lotus-foreground mb-2 group-hover:text-lotus-primary transition-colors">
          {title}
        </h3>
        <p className="font-sans text-sm text-lotus-foreground/70 leading-relaxed mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between border-t border-lotus-muted/20 pt-4 mt-auto">
          {price && (
            <p className="font-bold text-lotus-primary">
              <span className="text-xs font-normal text-lotus-foreground/50">Từ </span>
              {price}
            </p>
          )}
          <button
            onClick={onBook}
            className="text-sm font-semibold text-lotus-primary hover:text-lotus-foreground flex items-center gap-1 transition-colors"
          >
            Tư vấn ngay
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────
interface ProductCardProps {
  image: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  rating?: number;
}

export function ProductCard({ image, name, category, price, originalPrice, rating = 5 }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-lotus-muted/30 hover:border-lotus-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative overflow-hidden aspect-square bg-lotus-secondary/10">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <Eyebrow className="mb-2 !text-[10px]">{category}</Eyebrow>
        <h4 className="font-display font-medium text-lotus-foreground text-base mb-2 line-clamp-2">{name}</h4>
        
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-lotus-highlight' : 'text-lotus-muted/30'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <div className="flex items-end gap-2 mt-auto">
          <span className="font-bold text-lg text-lotus-primary">{price}</span>
          {originalPrice && (
            <span className="text-sm text-lotus-foreground/50 line-through mb-0.5">{originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TestimonialCard ───────────────────────────────────────────────────────
interface TestimonialCardProps {
  content: string;
  name: string;
  role: string;
  avatar: string;
  rating?: number;
}

export function TestimonialCard({ content, name, role, avatar, rating = 5 }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-lotus-muted/30 hover:shadow-xl hover:shadow-lotus-primary/5 transition-all duration-300 h-full flex flex-col">
      <div className="flex gap-1 mb-6">
        {Array.from({ length: rating }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-lotus-highlight" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="font-sans text-lotus-foreground/80 leading-relaxed flex-1 text-sm md:text-base italic">"{content}"</p>
      
      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-lotus-muted/20">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="font-display font-medium text-lotus-foreground">{name}</p>
          <p className="font-sans text-xs text-lotus-foreground/60">{role}</p>
        </div>
      </div>
    </div>
  );
}
