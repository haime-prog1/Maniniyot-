import { motion } from 'framer-motion';
import { Compass, Film, Map, Plus, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn, spring } from '../../lib/utils';
import { useUI } from '../../store/useUI';

const tabs = [
  { to: '/', label: 'Discover', icon: Compass },
  { to: '/trips', label: 'My Trips', icon: Map },
  { to: '/reel', label: 'Reel', icon: Film },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function TabBar() {
  const openCreate = useUI((s) => s.openCreate);

  const renderTab = (t: (typeof tabs)[number]) => (
    <NavLink
      key={t.to}
      to={t.to}
      end={t.to === '/'}
      className="relative flex h-12 w-[62px] flex-col items-center justify-center rounded-full text-[10px] font-medium"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span layoutId="tab-pill" transition={spring} className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/15" />
          )}
          <t.icon size={21} className={cn('relative', isActive && 'text-orange-500')} aria-hidden />
          <span className={cn('relative mt-0.5', isActive ? 'text-orange-500' : 'text-2')}>{t.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 flex justify-center px-4">
      <div className="glass-strong pointer-events-auto flex items-center gap-1 rounded-full p-1.5">
        {tabs.slice(0, 2).map(renderTab)}
        <motion.button
          aria-label="Create a new guide"
          whileTap={{ scale: 0.9 }}
          transition={spring}
          onClick={() => openCreate()}
          className="mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
        >
          <Plus size={24} />
        </motion.button>
        {tabs.slice(2).map(renderTab)}
      </div>
    </nav>
  );
}
