import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Calendar, Heart, Sparkles, Leaf, 
  Users, Star, Menu, X, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Calendar', page: 'Calendar', icon: Calendar },
  { name: 'Events', page: 'Events', icon: Star },
  { name: 'Affirmations', page: 'Affirmations', icon: Sparkles },
  { name: 'Beauty', page: 'Beauty', icon: Heart },
  { name: 'Meditation', page: 'Meditation', icon: Leaf },
  { name: 'Self-Care', page: 'SelfCare', icon: Heart },
  { name: 'Family', page: 'Family', icon: Users },
  { name: 'Progress', page: 'Progress', icon: Trophy },
];

export default function Layout({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Hide layout on certain pages for immersive experience
  const immersivePages = ['Meditation'];
  const isImmersive = immersivePages.includes(currentPageName);
  
  if (isImmersive) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-amber-200/50">
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-lg text-neutral-900 tracking-tight">Daily Essence</h1>
          <div className="w-9" /> {/* Spacer for centering */}
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif text-neutral-900 tracking-tight">Daily Essence</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-stone-100 rounded-lg"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                
                <nav className="space-y-1">
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
                            ? 'bg-gradient-to-r from-amber-50 to-stone-50 text-amber-700 border border-amber-200/50'
                            : 'text-slate-600 hover:bg-stone-50'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isActive && 'text-amber-600')} />
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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-sm border-r border-amber-200/50 flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">
            Daily Essence
          </h1>
          <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-widest font-light">Where Chaos Meets Clarity</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
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
                    ? 'bg-gradient-to-r from-amber-100 to-stone-100 text-amber-900 border border-amber-200'
                    : 'text-stone-700 hover:bg-stone-50'
                )}
              >
                <Icon className={cn('w-5 h-5')} strokeWidth={1.5} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border border-amber-200/50 shadow-sm">
          <p className="text-xs text-amber-900 font-medium uppercase tracking-widest">Self-Care Reminder</p>
          <p className="text-xs text-stone-700 mt-2 leading-relaxed">
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