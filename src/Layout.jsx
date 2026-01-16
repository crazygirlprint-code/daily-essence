import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Calendar, Heart, Sparkles, Leaf, 
  Users, Star, Menu, X, Trophy, MessageCircle, Moon, Sun, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeProvider, useTheme } from '@/components/hooks/useTheme';
import NotificationBanner from '@/components/notifications/NotificationBanner';
import UpcomingNotification from '@/components/notifications/UpcomingNotification';

const navItems = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Calendar', page: 'Calendar', icon: Calendar },
  { name: 'Activities', page: 'Activities', icon: Zap },
  { name: 'Community', page: 'Community', icon: MessageCircle },
  { name: 'Events', page: 'Events', icon: Star },
  { name: 'Affirmations', page: 'Affirmations', icon: Sparkles },
  { name: 'Beauty', page: 'Beauty', icon: Heart },
  { name: 'Meditation', page: 'Meditation', icon: Leaf },
  { name: 'Self-Care', page: 'SelfCare', icon: Heart },
  { name: 'Budget', page: 'Budget', icon: Sparkles },
  { name: 'Family', page: 'Family', icon: Users },
  { name: 'Progress', page: 'Progress', icon: Trophy },
  { name: 'Profile', page: 'Profile', icon: Users },
  { name: 'Pricing', page: 'Pricing', icon: Star },
];

function LayoutContent({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  
  // Hide layout on certain pages for immersive experience
  const immersivePages = [];
  const isImmersive = immersivePages.includes(currentPageName);
  
  if (isImmersive) {
    return (
      <div className="min-h-screen dark:bg-neutral-950">
        <button
          onClick={() => window.history.back()}
          className="fixed top-4 left-4 z-50 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    );
    }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 dark-luxury:from-slate-950 dark-luxury:via-slate-900 dark-luxury:to-slate-950">
      <NotificationBanner />
      <UpcomingNotification />
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 dark-luxury:bg-slate-950/98 backdrop-blur-xl border-b border-stone-200/50 dark:border-neutral-800 dark-luxury:border-amber-900/30">
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <Menu className="w-5 h-5 text-neutral-900 dark:text-stone-100" strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-lg text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400 tracking-tight">Daily Essence</h1>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-200" /> : <Moon className="w-5 h-5 text-stone-600" />}
          </button>
        </div>
      </header>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 dark-luxury:bg-slate-950 shadow-2xl z-50 md:hidden backdrop-blur-xl dark-luxury:backdrop-blur-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400 tracking-tight">Daily Essence</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    <X className="w-5 h-5 dark:text-stone-100" strokeWidth={1.5} />
                  </button>
                </div>
                
                <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/20 dark:from-neutral-800 dark:to-neutral-800 dark-luxury:from-amber-900/40 dark-luxury:to-amber-900/20 text-slate-700 dark:text-slate-300 dark-luxury:text-amber-300 border border-stone-200/50 dark:border-neutral-700 dark-luxury:border-amber-900/30'
                            : 'text-slate-600 dark:text-stone-400 dark-luxury:text-slate-400 hover:bg-stone-50 dark:hover:bg-neutral-800 dark-luxury:hover:bg-amber-900/10'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isActive && 'text-slate-600')} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white/80 dark:bg-neutral-900/80 dark-luxury:bg-slate-950/90 backdrop-blur-xl border-r border-stone-200/50 dark:border-neutral-800 dark-luxury:border-amber-900/30 flex-col">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400 tracking-tight">
              Daily Essence
            </h1>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 dark-luxury:text-slate-400 mt-1 uppercase tracking-widest font-light">Where Chaos Meets Clarity</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-200" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-amber-900/30 to-amber-900/15 dark:from-neutral-800 dark:to-neutral-800 dark-luxury:from-amber-900/40 dark-luxury:to-amber-900/20 text-slate-700 dark:text-slate-300 dark-luxury:text-amber-300 border border-stone-200 dark:border-neutral-700 dark-luxury:border-amber-900/30'
                    : 'text-stone-700 dark:text-stone-400 dark-luxury:text-slate-400 hover:bg-stone-50 dark:hover:bg-neutral-800 dark-luxury:hover:bg-amber-900/10'
                )}
              >
                <Icon className={cn('w-5 h-5')} strokeWidth={1.5} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 bg-gradient-to-br from-amber-900/20 to-amber-900/10 dark:from-neutral-800 dark:to-neutral-800 dark-luxury:from-amber-900/30 dark-luxury:to-amber-900/20 rounded-lg border border-stone-200/50 dark:border-neutral-700 dark-luxury:border-amber-900/30 shadow-sm backdrop-blur-sm">
         <p className="text-xs text-slate-700 dark:text-slate-300 dark-luxury:text-amber-400 font-medium uppercase tracking-widest">Self-Care Reminder</p>
          <p className="text-xs text-stone-700 dark:text-stone-400 dark-luxury:text-slate-300 mt-2 leading-relaxed">
            Don't forget to schedule some me-time this week!
          </p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}