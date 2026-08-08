import type { LucideIcon } from 'lucide-react';

type IconProps = {
  icon: LucideIcon;
  size?: number;
  className?: string;
};

export function Icon({ icon: LucideIconComponent, size = 16, className = '' }: IconProps) {
  return <LucideIconComponent size={size} className={className} />;
}
