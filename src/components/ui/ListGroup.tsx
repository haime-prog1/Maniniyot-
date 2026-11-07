import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/** iOS grouped inset list. */
export function ListGroup({ title, footer, children }: { title?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6">
      {title && <h2 className="text-2 px-4 pb-1.5 text-[13px] font-medium uppercase tracking-wide">{title}</h2>}
      <div className="glass divide-y overflow-hidden rounded-[22px] [&>*]:hairline">{children}</div>
      {footer && <div className="text-2 px-4 pt-1.5 text-[13px]">{footer}</div>}
    </section>
  );
}

interface RowProps {
  icon?: ReactNode;
  label: ReactNode;
  detail?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  chevron?: boolean;
}

export function ListRow({ icon, label, detail, right, onClick, destructive, chevron }: RowProps) {
  const content = (
    <>
      {icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-black/5 dark:bg-white/10">{icon}</span>}
      <span className={cn('flex-1 text-left text-[16px]', destructive && 'text-red-600 dark:text-red-400')}>{label}</span>
      {detail && <span className="text-2 text-[15px]">{detail}</span>}
      {right}
      {chevron && <ChevronRight size={18} className="text-2" aria-hidden />}
    </>
  );
  const cls = 'flex min-h-[52px] w-full items-center gap-3 px-4 py-2';
  return onClick ? (
    <button onClick={onClick} className={cn(cls, 'active:bg-black/5 dark:active:bg-white/5')}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  );
}
