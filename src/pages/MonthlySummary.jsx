import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie
} from 'recharts';
import { Trophy, Flame, Target, Zap, TrendingUp, Award, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS = {
  work: '#64748b',
  home: '#0ea5e9',
  kids: '#ec4899',
  'self-care': '#8b5cf6',
  errands: '#f59e0b',
};

const CATEGORY_LABELS = {
  work: 'Work',
  home: 'Home',
  kids: 'Kids',
  'self-care': 'Self-Care',
  errands: 'Errands',
};

function SummaryCard({ label, value, sublabel, icon: Icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm"
    >
      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', gradient)}>
        <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
      </div>
      <p className="text-3xl font-serif font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">{label}</p>
      {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-stone-200 px-3 py-2 text-xs">
      <p className="font-medium text-slate-900 mb-1">{label}</p>
      <p className="text-stone-600">{payload[0].value} task{payload[0].value !== 1 ? 's' : ''} completed</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-stone-200 px-3 py-2 text-xs">
      <p className="font-medium text-slate-900">{entry.name}</p>
      <p className="text-stone-600">{entry.value} task{entry.value !== 1 ? 's' : ''}</p>
    </div>
  );
}

export default function MonthlySummary() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });

  const progress = progressList[0] || {};

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthLabel = format(new Date(), 'MMMM yyyy');

  const dailyData = useMemo(() => {
    const byDate = {};
    tasks.forEach(task => {
      if (task.completed && task.updated_date) {
        const taskDate = new Date(task.updated_date);
        if (isSameMonth(taskDate, new Date())) {
          const key = format(taskDate, 'yyyy-MM-dd');
          byDate[key] = (byDate[key] || 0) + 1;
        }
      }
    });
    return daysInMonth.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'MMM d'),
      dayNum: format(day, 'd'),
      completed: byDate[format(day, 'yyyy-MM-dd')] || 0,
    }));
  }, [tasks, daysInMonth]);

  const categoryData = useMemo(() => {
    const byCategory = {};
    tasks.forEach(task => {
      if (task.completed && task.updated_date && isSameMonth(new Date(task.updated_date), new Date())) {
        const cat = task.category || 'other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    });
    return Object.entries(byCategory).map(([category, count]) => ({
      name: CATEGORY_LABELS[category] || category,
      category,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [tasks]);

  const totalCompletedThisMonth = dailyData.reduce((sum, d) => sum + d.completed, 0);
  const bestDay = dailyData.reduce(
    (max, d) => (d.completed > max.completed ? d : max),
    { completed: 0, label: '-' }
  );
  const activeDays = dailyData.filter(d => d.completed > 0).length;
  const maxDaily = Math.max(...dailyData.map(d => d.completed), 1);

  const summaryCards = [
    {
      label: 'Tasks Completed',
      value: totalCompletedThisMonth,
      sublabel: `across ${activeDays} active day${activeDays !== 1 ? 's' : ''}`,
      icon: Target,
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      label: 'Day Streak',
      value: progress.streak_days || 0,
      sublabel: 'keep it going!',
      icon: Flame,
      gradient: 'from-orange-400 to-red-500',
    },
    {
      label: 'Level Reached',
      value: progress.level || 1,
      sublabel: `${progress.points || 0} total points`,
      icon: Trophy,
      gradient: 'from-amber-400 to-yellow-500',
    },
    {
      label: 'Best Day',
      value: bestDay.completed,
      sublabel: bestDay.label !== '-' ? `on ${bestDay.label}` : 'no data yet',
      icon: TrendingUp,
      gradient: 'from-violet-400 to-purple-500',
    },
  ];

  const badges = progress.badges || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
            <p className="text-xs text-stone-500 uppercase tracking-widest">{monthLabel}</p>
          </div>
          <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Monthly Summary</h1>
          <p className="text-sm text-stone-500 mt-1">Your accomplishments at a glance this month</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, i) => (
            <SummaryCard
              key={card.label}
              label={card.label}
              value={card.value}
              sublabel={card.sublabel}
              icon={card.icon}
              gradient={card.gradient}
            />
          ))}
        </div>

        {/* Daily Completions Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-stone-200/60 shadow-sm mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg text-slate-900">Daily Task Completions</h2>
              <p className="text-xs text-stone-500 mt-0.5">Tasks completed each day this month</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-slate-600 to-slate-700" />
              <span>Completed</span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : totalCompletedThisMonth === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Target className="w-10 h-10 text-stone-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-stone-500">No tasks completed yet this month</p>
              <p className="text-xs text-stone-400 mt-1">Complete some tasks to see your progress chart</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dayNum"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.completed > 0 ? '#475569' : '#e2e8f0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category Breakdown + Badges */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-stone-200/60 shadow-sm"
          >
            <h2 className="font-serif text-lg text-slate-900 mb-1">By Category</h2>
            <p className="text-xs text-stone-500 mb-4">Where your effort went</p>

            {categoryData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Target className="w-8 h-8 text-stone-300 mb-2" strokeWidth={1} />
                <p className="text-xs text-stone-500">No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cat-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                        />
                        <span className="text-stone-700">{cat.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Badges Earned */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-stone-200/60 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
              <h2 className="font-serif text-lg text-slate-900">Badges Earned</h2>
            </div>
            <p className="text-xs text-stone-500 mb-4">{badges.length} achievement{badges.length !== 1 ? 's' : ''} unlocked</p>

            {badges.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-stone-300 mb-2" strokeWidth={1} />
                <p className="text-xs text-stone-500">No badges yet</p>
                <p className="text-xs text-stone-400 mt-0.5">Complete tasks to earn badges</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, i) => (
                  <motion.div
                    key={badge}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100"
                  >
                    <span className="text-2xl mb-1">
                      {badge.includes('task') ? '⭐' :
                       badge.includes('meditation') ? '🧘' :
                       badge.includes('beauty') ? '💄' :
                       badge.includes('self_care') ? '🛁' :
                       badge.includes('streak') ? '🔥' :
                       badge.includes('level') ? '🌟' :
                       badge.includes('meal') ? '🍳' :
                       badge.includes('planning') ? '📋' :
                       badge.includes('note') ? '📚' :
                       '🏆'}
                    </span>
                    <span className="text-[10px] text-stone-600 leading-tight">
                      {badge.replace(/_/g, ' ')}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-slate-50 to-stone-50 rounded-2xl p-6 border border-stone-200/60 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-serif text-lg text-slate-900">Level {progress.level || 1}</h2>
              <p className="text-xs text-stone-500">{progress.points || 0} total points earned</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Tasks Completed (All Time)', value: progress.total_tasks_completed || 0, icon: '✅' },
              { label: 'Current Streak', value: `${progress.streak_days || 0} days`, icon: '🔥' },
              { label: 'Badges Unlocked', value: badges.length, icon: '🏆' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-2 border-b border-stone-200/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-sm text-stone-700">{stat.label}</span>
                </div>
                <span className="font-serif text-lg font-semibold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}