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
    <div className="min-h-screen bg-stone-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-stone-100 rounded-xl"
          >
            <Menu className="w-5 h-5 text-stone-600" />
          </button>
          <h1 className="font-serif font-light text-lg text-stone-800 tracking-tight">Mom's Planner</h1>
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
                  <h2 className="text-xl font-serif font-light text-stone-800 tracking-tight">Mom's Planner</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-stone-100 rounded-xl"
                  >
                    <X className="w-5 h-5" />
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
                            ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isActive && 'text-rose-500')} />
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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200 flex-col">
        <div className="p-6">
          <h1 className="text-xl font-serif font-light text-stone-800 tracking-tight">
            Mom's Planner
          </h1>
          <p className="text-xs text-stone-400 mt-1 tracking-wide">Your daily companion</p>
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
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-amber-50 to-stone-50 text-stone-800 shadow-sm border border-stone-200/50'
                    : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-amber-700')} />
                <span className="font-medium tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl border border-stone-200/50">
          <p className="text-sm text-stone-800 font-medium">💛 Self-Care Reminder</p>
          <p className="text-xs text-stone-600/70 mt-1 tracking-wide">
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