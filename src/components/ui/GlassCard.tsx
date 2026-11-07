import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn, spring } from '../../lib/utils';

type Props = HTMLMotionProps<'div'> & { interactive?: boolean; strong?: boolean };

export function GlassCard({ interactive, strong, className, children, ...rest }: Props) {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.97 } : undefined}
      transition={spring}
      className={cn(strong ? 'glass-strong' : 'glass', 'rounded-[24px]', interactive && 'cursor-pointer', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
