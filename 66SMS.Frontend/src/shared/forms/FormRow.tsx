import type { ReactNode } from 'react';

type FormRowProps = {
  children?: ReactNode;
  className?: string;
};

export function FormRow({ children, className = '' }: FormRowProps) {
  return (
    <div className={'grid grid-cols-1 gap-3 sm:grid-cols-2 ' + className}>{children}</div>
  );
}
