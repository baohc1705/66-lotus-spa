import React from 'react';


interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Display = ({ children, className, as: Component = 'h1', ...props }: TypographyProps) => (
  <Component className={`font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-lotus-foreground ${className || ''}`.trim()} {...props}>
    {children}
  </Component>
);

export const Heading = ({ children, className, as: Component = 'h2', ...props }: TypographyProps) => (
  <Component className={`font-display text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-lotus-foreground ${className || ''}`.trim()} {...props}>
    {children}
  </Component>
);

export const Eyebrow = ({ children, className, as: Component = 'span', ...props }: TypographyProps) => (
  <Component className={`font-mono text-xs md:text-sm uppercase tracking-widest text-lotus-accent ${className || ''}`.trim()} {...props}>
    {children}
  </Component>
);

export const Body = ({ children, className, as: Component = 'p', ...props }: TypographyProps) => (
  <Component className={`font-sans text-base md:text-lg leading-relaxed text-lotus-foreground/80 ${className || ''}`.trim()} {...props}>
    {children}
  </Component>
);

export const Quote = ({ children, className, as: Component = 'blockquote', ...props }: TypographyProps) => (
  <Component className={`font-display italic text-xl md:text-2xl text-lotus-primary leading-relaxed ${className || ''}`.trim()} {...props}>
    {children}
  </Component>
);
