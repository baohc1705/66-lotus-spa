import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClass?: string;
  fullWidth?: boolean;
}

export const Section = ({ children, className, containerClass, fullWidth = false, ...props }: SectionProps) => {
  return (
    <section className={`py-16 md:py-24 lg:py-32 ${className || ''}`.trim()} {...props}>
      {fullWidth ? (
        children
      ) : (
        <div className={`container mx-auto px-4 md:px-6 ${containerClass || ''}`.trim()}>
          {children}
        </div>
      )}
    </section>
  );
};
