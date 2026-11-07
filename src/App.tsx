import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Background, TabBar } from './components/ui';
import { CreateGuideSheet } from './features/create/CreateGuideSheet';
import { HomeScreen } from './features/home/HomeScreen';
import { ReelBuilder } from './features/reel/ReelBuilder';
import { Settings } from './features/settings/Settings';
import { ShotListScreen } from './features/shotlist/ShotListScreen';
import { MyTrips } from './features/trips/MyTrips';
import { StoryStudio } from './features/stories/StoryStudio';
import { spring } from './lib/utils';
import { useStore } from './store/useStore';

function useTheme() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#05070d' : '#f3efe8');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={spring}
        className="relative z-10 mx-auto min-h-[100dvh] max-w-[430px] pb-[calc(env(safe-area-inset-bottom)+80px)]"
      >
        <Routes location={location}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/list/:id" element={<ShotListScreen />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/stories/:id" element={<StoryStudio />} />
          <Route path="/reel" element={<ReelBuilder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<HomeScreen />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  useTheme();
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Background />
        <AnimatedRoutes />
        <TabBar />
        <CreateGuideSheet />
      </HashRouter>
    </MotionConfig>
  );
}
