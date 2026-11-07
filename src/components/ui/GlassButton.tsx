import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn, spring } from '../../lib/utils';

type Props = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
  variant?: 'glass' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  full?: boolean;
};

const sizes = {
  sm: 'h-9 px-4 text-[14px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-14 px-6 text-[17px]',
};

const variants = {
  glass: 'glass',
  primary: 'text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30',
  danger: 'glass text-red-600 dark:text-red-400',
};

export const buttonClass = (variant: keyof typeof variants = 'glass', size: keyof typeof sizes = 'md', full?: boolean) =>
  cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold disabled:opacity-40',
    sizes[size],
    variants[variant],
    full && 'w-full',
  );

export function GlassButton({ variant = 'glass', size = 'md', icon, full, className, children, type = 'button', ...rest }: Props) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className={cn(buttonClass(variant, size, full), className)}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
