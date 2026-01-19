import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Plus, TrendingUp, TrendingDown, Calendar,
  CreditCard, Wallet, PiggyBank, ShoppingCart, UtensilsCrossed,
  Car, Zap, Heart, Film, Baby, GraduationCap, User, Lock, AlertTriangle,
  Target, Edit2, Users, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CATEGORY_CONFIG = {
  groceries: { icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-600', name: 'Groceries' },
  dining: { icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600', name: 'Dining Out' },
  shopping: { icon: ShoppingCart, color: 'bg-pink-100 text-pink-600', name: 'Shopping' },
  transportation: { icon: Car, color: 'bg-blue-100 text-blue-600', name: 'Transportation' },
  utilities: { icon: Zap, color: 'bg-yellow-100 text-yellow-600', name: 'Utilities' },
  healthcare: { icon: Heart, color: 'bg-red-100 text-red-600', name: 'Healthcare' },
  entertainment: { icon: Film, color: 'bg-purple-100 text-purple-600', name: 'Entertainment' },
  childcare: { icon: Baby, color: 'bg-cyan-100 text-cyan-600', name: 'Childcare' },
  education: { icon: GraduationCap, color: 'bg-indigo-100 text-indigo-600', name: 'Education' },
  personal: { icon: User, color: 'bg-rose-100 text-rose-600', name: 'Personal' },
  other: { icon: Wallet, color: 'bg-slate-100 text-slate-600', name: 'Other' },
};

export default function Budget() {
  const [timeView, setTimeView] = useState('month');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: 'groceries',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'credit_card',
    type: 'expense',
    family_member: ''
  });
  const [newBudget, setNewBudget] = useState({
    category: 'groceries',
    monthly_limit: '',
    month: format(new Date(), 'yyyy-MM')
  });

  const queryClient = useQueryClient();

  // Check subscription status - only Radiant tier and admin
  React.useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me();
        // Only Radiant tier (top tier) or admin can access
        const isRadiantTier = user.subscription_status === 'active' && 
          (user.subscription_plan === 'Radiant' || user.subscription_plan === 'radiant');
        const isAdmin = user.role === 'admin';
        setHasAccess(isRadiantTier || isAdmin);
      } catch (error) {
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSubscription();
  }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date'),
    enabled: hasAccess
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => base44.entities.Budget.list(),
    enabled: hasAccess
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
    enabled: hasAccess
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsAddOpen(false);
      setNewTransaction({
        amount: '',
        category: 'groceries',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'credit_card',
        type: 'expense',
        family_member: ''
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data) => base44.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsBudgetOpen(false);
      setNewBudget({
        category: 'groceries',
        monthly_limit: '',
        month: format(new Date(), 'yyyy-MM')
      });
    }
  });

  // Calculate date ranges
  const now = new Date();
  const ranges = {
    day: { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') },
    week: { start: format(startOfWeek(now), 'yyyy-MM-dd'), end: format(endOfWeek(now), 'yyyy-MM-dd') },
    month: { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') },
    year: { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
  };

  const currentRange = ranges[timeView];

  // Filter transactions by time period and family member
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.date;
      const dateMatch = tDate >= currentRange.start && tDate <= currentRange.end;
      const memberMatch = selectedMember === 'all' || t.family_member === selectedMember;
      return dateMatch && memberMatch;
    });
  }, [transactions, currentRange, selectedMember]);

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Family Member'];
    const csvRows = filteredTransactions.map(t => [
      t.date,
      t.type,
      CATEGORY_CONFIG[t.category].name,
      t.amount,
      t.description || '',
      t.payment_method,
      t.family_member || ''
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  // Calculate totals
  const totalIncome = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpenses = useMemo(() =>
    filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpenses;

  // Group by category
  const expensesByCategory = useMemo(() => {
    const grouped = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = 0;
      grouped[t.category] += t.amount;
    });
    return grouped;
  }, [filteredTransactions]);

  // Get current month budgets
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentBudgets = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth);
  }, [budgets, currentMonth]);

  // Chart data
  const chartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: CATEGORY_CONFIG[category].name,
      value: amount,
      color: CATEGORY_CONFIG[category].color
    }));
  }, [expensesByCategory]);

  const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

  // Smart categorization helper
  const suggestCategory = (description) => {
    if (!description) return null;
    const text = description.toLowerCase();
    
    const categoryKeywords = {
      groceries: ['recipe', 'ingredients', 'grocery', 'groceries', 'supermarket', 'whole foods', 'trader joe', 'costco', 'walmart', 'milk', 'bread', 'eggs', 'chicken', 'beef', 'vegetables', 'fruits', 'pasta', 'rice', 'cooking', 'food', 'produce'],
      dining: ['restaurant', 'cafe', 'coffee', 'starbucks', 'dinner', 'lunch', 'breakfast', 'takeout', 'delivery', 'uber eats', 'doordash', 'grubhub', 'chipotle', 'mcdonalds', 'pizza'],
      transportation: ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'car', 'parking', 'toll', 'metro', 'subway', 'train', 'bus', 'transit', 'vehicle', 'auto', 'repair', 'mechanic', 'oil change'],
      healthcare: ['doctor', 'hospital', 'pharmacy', 'cvs', 'walgreens', 'medicine', 'prescription', 'dental', 'dentist', 'medical', 'clinic', 'health', 'therapy', 'appointment'],
      entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'concert', 'theater', 'tickets', 'game', 'entertainment', 'amusement', 'disney', 'streaming'],
      childcare: ['daycare', 'babysitter', 'nanny', 'childcare', 'preschool', 'kids', 'children', 'babysitting'],
      education: ['school', 'tuition', 'books', 'supplies', 'course', 'class', 'university', 'college', 'education', 'learning', 'textbook'],
      personal: ['haircut', 'salon', 'spa', 'massage', 'manicure', 'pedicure', 'barber', 'beauty', 'skincare', 'makeup', 'cosmetics', 'sephora', 'ulta'],
      shopping: ['amazon', 'target', 'mall', 'clothing', 'clothes', 'shoes', 'fashion', 'store', 'shopping', 'retail'],
      utilities: ['electric', 'electricity', 'water', 'gas bill', 'internet', 'phone', 'cable', 'utility', 'utilities', 'bill']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  // Auto-suggest category when description changes
  React.useEffect(() => {
    if (newTransaction.description && isAddOpen) {
      const suggested = suggestCategory(newTransaction.description);
      if (suggested && newTransaction.category !== suggested) {
        setNewTransaction(prev => ({ ...prev, category: suggested }));
      }
    }
  }, [newTransaction.description, isAddOpen]);

  // Subscription gate
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 shadow-xl border-2 border-stone-200 dark:border-purple-500/60"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-stone-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-serif text-slate-800 mb-4">Radiant Tier Feature</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Budget tracking with AI insights is available exclusively with the Radiant tier ($19.99/month). 
              Get powerful insights into your spending, set intelligent budgets, and achieve your financial goals with unlimited AI coaching.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-slate-700">Track expenses across all categories</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-slate-700">Daily, weekly, monthly & yearly views</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-slate-700">Set budgets and monitor spending</span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/Pricing'}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 h-12 rounded-xl shadow-lg"
            >
              Upgrade to Radiant
            </Button>
            <p className="text-xs text-slate-400 mt-4">Cancel anytime</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-stone-100 mb-2">Budget Tracker</h1>
            <p className="text-slate-600 dark:text-stone-300">Manage your finances with clarity</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="gap-2 bg-slate-600 text-white border-slate-700 hover:bg-slate-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:text-white dark:border-rose-600 dark:hover:from-rose-700 dark:hover:to-pink-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsBudgetOpen(true)}
              variant="outline"
              className="gap-2 bg-slate-600 text-white border-slate-700 hover:bg-slate-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:text-white dark:border-rose-600 dark:hover:from-rose-700 dark:hover:to-pink-700"
            >
              <Target className="w-4 h-4" />
              Set Budget
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Tabs value={timeView} onValueChange={setTimeView}>
              <TabsList className="grid grid-cols-4 w-full bg-white/50 dark:bg-white/10 border-2 border-stone-200 dark:border-purple-500/60 rounded-2xl p-1">
                <TabsTrigger value="day" className="rounded-xl dark:text-stone-300 dark:data-[state=active]:bg-rose-700/50 dark:data-[state=active]:text-white">Today</TabsTrigger>
                <TabsTrigger value="week" className="rounded-xl dark:text-stone-300 dark:data-[state=active]:bg-rose-700/50 dark:data-[state=active]:text-white">Week</TabsTrigger>
                <TabsTrigger value="month" className="rounded-xl dark:text-stone-300 dark:data-[state=active]:bg-rose-700/50 dark:data-[state=active]:text-white">Month</TabsTrigger>
                <TabsTrigger value="year" className="rounded-xl dark:text-stone-300 dark:data-[state=active]:bg-rose-700/50 dark:data-[state=active]:text-white">YTD</TabsTrigger>
              </TabsList>
            </Tabs>

          {familyMembers.length > 0 && (
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="bg-white/50 dark:bg-white/15 dark:text-stone-100 border-2 border-stone-200 dark:border-purple-500/60 rounded-2xl">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Family Members</SelectItem>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60"
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-stone-100">${totalIncome.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-rose-400 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-stone-100">${totalExpenses.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'rounded-2xl p-6 shadow-sm',
              netBalance >= 0 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-purple-500/60' 
                : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-purple-500/60'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={cn('w-5 h-5', netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400')} />
              <span className="text-sm font-medium text-slate-700 dark:text-stone-300">Net Balance</span>
            </div>
            <p className={cn('text-3xl font-bold', netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-rose-300')}>
              ${Math.abs(netBalance).toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Budget Progress */}
        {currentBudgets.length > 0 && (
          <div className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60 mb-8">
            <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4">Monthly Budget Progress</h3>
            <div className="space-y-4">
              {currentBudgets.map((budget) => {
                const spent = expensesByCategory[budget.category] || 0;
                const percentage = (spent / budget.monthly_limit) * 100;
                const isOverBudget = percentage > 100;
                const isWarning = percentage >= 80 && percentage <= 100;
                const config = CATEGORY_CONFIG[budget.category];
                const Icon = config.icon;

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', config.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 dark:text-stone-200">{config.name}</p>
                          <p className="text-xs text-slate-400 dark:text-stone-400">Budget: ${budget.monthly_limit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {isWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <p className={cn(
                            'font-bold',
                            isOverBudget ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-800'
                          )}>
                            ${spent.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">{percentage.toFixed(0)}% used</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        className={cn(
                          'h-full',
                          isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        )}
                      />
                    </div>
                    {isOverBudget && (
                      <p className="text-xs text-red-600 font-medium">
                        Over budget by ${(spent - budget.monthly_limit).toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60">
              <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4">Spending Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60">
              <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4">Category Spending</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-stone-200/50 dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border-2 border-stone-200 dark:border-purple-500/60">
          <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTransactions.slice(0, 10).map((transaction) => {
                const config = CATEGORY_CONFIG[transaction.category];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-stone-200">{transaction.description || config.name}</p>
                        <p className="text-xs text-slate-400">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn(
                        'font-bold',
                        transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-stone-100'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Transaction Button */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 text-white bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-600/30 dark:bg-gradient-to-r dark:from-rose-500 dark:to-pink-600 dark:hover:from-rose-600 dark:hover:to-pink-700 dark:shadow-rose-500/40"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl border-2 border-stone-200 dark:border-purple-500/60">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Expense
              </Button>
              <Button
                variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Income
              </Button>
            </div>

            <Input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
            />

            <Select
              value={newTransaction.category}
              onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
            >
              <SelectTrigger className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
            />

            <Input
              placeholder="Description (optional)"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
            />

            {familyMembers.length > 0 && (
              <Select
                value={newTransaction.family_member}
                onValueChange={(v) => setNewTransaction({ ...newTransaction, family_member: v })}
              >
                <SelectTrigger className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60">
                  <SelectValue placeholder="Family Member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {familyMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={newTransaction.payment_method}
              onValueChange={(v) => setNewTransaction({ ...newTransaction, payment_method: v })}
            >
              <SelectTrigger className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => createTransactionMutation.mutate({
                ...newTransaction,
                amount: parseFloat(newTransaction.amount)
              })}
              disabled={!newTransaction.amount || parseFloat(newTransaction.amount) <= 0}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Add Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
        <DialogContent className="rounded-3xl border-2 border-stone-200 dark:border-purple-500/60">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Select
              value={newBudget.category}
              onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}
            >
              <SelectTrigger className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Monthly Limit"
              value={newBudget.monthly_limit}
              onChange={(e) => setNewBudget({ ...newBudget, monthly_limit: e.target.value })}
              className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
            />

            <Input
              type="month"
              value={newBudget.month}
              onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
              className="rounded-xl border-2 border-stone-200 dark:border-purple-500/60"
            />

            <Button
              onClick={() => createBudgetMutation.mutate({
                ...newBudget,
                monthly_limit: parseFloat(newBudget.monthly_limit)
              })}
              disabled={!newBudget.monthly_limit || parseFloat(newBudget.monthly_limit) <= 0}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              Set Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}