import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClass?: string;
  fullWidth?: boolean;
}

export const Section = ({ children, className, containerClass, fullWidth = false, ...props }: SectionProps) => {
  return (
    <section className={cn("py-16 md:py-24 lg:py-32", className)} {...props}>
      {fullWidth ? (
        children
      ) : (
        <div className={cn("container mx-auto px-4 md:px-6", containerClass)}>
          {children}
        </div>
      )}
    </section>
  );
};
