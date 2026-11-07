import { motion } from 'framer-motion';
import { Clapperboard, Home, LayoutGrid, PlusSquare, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn, spring } from '../../lib/utils';
import { useUI } from '../../store/useUI';

const tabs = [
  { to: '/', label: 'Discover', icon: Home },
  { to: '/trips', label: 'My Trips', icon: LayoutGrid },
  { to: '/reel', label: 'Reel Builder', icon: Clapperboard },
  { to: '/settings', label: 'Settings', icon: UserRound },
];

/** Flat, icon-only bottom bar in the style of social apps. */
export function TabBar() {
  const openCreate = useUI((s) => s.openCreate);

  const renderTab = (t: (typeof tabs)[number]) => (
    <NavLink key={t.to} to={t.to} end={t.to === '/'} aria-label={t.label} className="relative flex h-12 flex-1 items-center justify-center">
      {({ isActive }) => (
        <>
          <motion.span animate={{ scale: isActive ? 1.08 : 1 }} transition={spring}>
            <t.icon size={26} strokeWidth={isActive ? 2.6 : 1.8} aria-hidden />
          </motion.span>
          {isActive && <motion.span layoutId="tab-dot" transition={spring} className="absolute bottom-0.5 h-1 w-1 rounded-full bg-ig" />}
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      aria-label="Main"
      className="glass-strong fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] !rounded-none !border-x-0 !border-b-0 pb-[env(safe-area-inset-bottom)] !shadow-none"
    >
      <div className={cn('flex items-center px-2 pt-1')}>
        {tabs.slice(0, 2).map(renderTab)}
        <motion.button
          aria-label="Create a new guide"
          whileTap={{ scale: 0.88 }}
          transition={spring}
          onClick={() => openCreate()}
          className="flex h-12 flex-1 items-center justify-center"
        >
          <PlusSquare size={27} strokeWidth={1.9} aria-hidden />
        </motion.button>
        {tabs.slice(2).map(renderTab)}
      </div>
    </nav>
  );
}
