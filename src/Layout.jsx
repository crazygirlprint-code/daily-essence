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
  { name: 'Profile', page: 'Profile', icon: Users },
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Calendar', page: 'Calendar', icon: Calendar },
  { name: 'Activities', page: 'Activities', icon: Zap },
  { name: 'Community', page: 'Community', icon: MessageCircle },
  { name: 'Affirmations', page: 'Affirmations', icon: Sparkles },
  { name: 'Meditation', page: 'Meditation', icon: Leaf },
  { name: 'Wellness', page: 'Wellness', icon: Heart },
  { name: 'Family', page: 'Family', icon: Users },
  { name: 'Budget', page: 'Budget', icon: Sparkles },
  { name: 'Progress', page: 'Progress', icon: Trophy },
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

  const darkBg = isDark ? {
    background: 'linear-gradient(to bottom, rgb(70, 45, 80), rgb(55, 35, 65), rgb(70, 45, 80))'
  } : {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white dark:from-black dark:via-rose-950/20 dark:to-black" style={darkBg}>
      <NotificationBanner />
      <UpcomingNotification />
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-stone-200/50 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <Menu className="w-5 h-5 text-neutral-900 dark:text-stone-100" strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-lg text-neutral-900 dark:text-stone-100 tracking-tight">Daily Essence</h1>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg"
            >
            {isDark ? <Sun className="w-5 h-5 text-rose-300" /> : <Moon className="w-5 h-5 text-stone-600" />}
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
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
                    className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg"
                    >
                    <X className="w-5 h-5 dark:text-rose-100" strokeWidth={1.5} />
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
                            ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/20 dark:from-rose-600/30 dark:to-pink-600/20 text-slate-700 dark:text-rose-100 border border-stone-200/50 dark:border-rose-500/40'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-rose-950/30'
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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white/80 dark:bg-purple-900/30 backdrop-blur-xl border-r border-stone-200/50 dark:border-purple-600/30 flex-col">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-neutral-900 dark:text-stone-100 tracking-tight">
              Daily Essence
            </h1>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest font-light">Where Chaos Meets Clarity</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            {isDark ? <Sun className="w-4 h-4 text-rose-300" /> : <Moon className="w-4 h-4 text-stone-600" />}
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
                    ? 'bg-gradient-to-r from-amber-900/30 to-amber-900/15 dark:from-rose-600/30 dark:to-pink-600/20 text-slate-700 dark:text-rose-100 border border-stone-200 dark:border-rose-500/40'
                    : 'text-stone-700 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-rose-950/30'
                )}
              >
                <Icon className={cn('w-5 h-5')} strokeWidth={1.5} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 bg-gradient-to-br from-amber-900/20 to-amber-900/10 dark:from-rose-500/10 dark:to-pink-500/5 rounded-lg border border-stone-200/50 dark:border-rose-500/20 shadow-sm backdrop-blur-sm">
         <p className="text-xs text-slate-700 dark:text-rose-200 font-medium uppercase tracking-widest">Self-Care Reminder</p>
         <p className="text-xs text-stone-700 dark:text-rose-100/80 mt-2 leading-relaxed">
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