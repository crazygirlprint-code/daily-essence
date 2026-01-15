import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Plus, TrendingUp, TrendingDown, Calendar,
  CreditCard, Wallet, PiggyBank, ShoppingCart, UtensilsCrossed,
  Car, Zap, Heart, Film, Baby, GraduationCap, User, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, parseISO } from 'date-fns';

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
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: 'groceries',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'credit_card',
    type: 'expense'
  });

  const queryClient = useQueryClient();

  // Check subscription status
  React.useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me();
        // Check if user has premium subscription
        const isSubscribed = user.subscription_status === 'active' || user.role === 'admin';
        setHasAccess(isSubscribed);
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
        type: 'expense'
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
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

  // Filter transactions by time period
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.date;
      return tDate >= currentRange.start && tDate <= currentRange.end;
    });
  }, [transactions, currentRange]);

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

  // Subscription gate
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 shadow-xl border border-amber-200"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-stone-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-serif text-slate-800 mb-4">Premium Feature</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Budget tracking and money management is available with a premium subscription. 
              Get insights into your spending, set budgets, and achieve your financial goals.
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
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 h-12 rounded-xl shadow-lg">
              Upgrade to Premium
            </Button>
            <p className="text-xs text-slate-400 mt-4">Cancel anytime</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-slate-800 mb-2">Budget Tracker</h1>
          <p className="text-slate-500">Manage your finances with clarity</p>
        </div>

        {/* Time Period Tabs */}
        <Tabs value={timeView} onValueChange={setTimeView} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full bg-white/50 rounded-2xl p-1">
            <TabsTrigger value="day" className="rounded-xl">Today</TabsTrigger>
            <TabsTrigger value="week" className="rounded-xl">Week</TabsTrigger>
            <TabsTrigger value="month" className="rounded-xl">Month</TabsTrigger>
            <TabsTrigger value="year" className="rounded-xl">YTD</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalIncome.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">${totalExpenses.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'rounded-2xl p-6 shadow-sm',
              netBalance >= 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-gradient-to-br from-red-50 to-orange-50'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={cn('w-5 h-5', netBalance >= 0 ? 'text-emerald-600' : 'text-red-600')} />
              <span className="text-sm font-medium text-slate-700">Net Balance</span>
            </div>
            <p className={cn('text-3xl font-bold', netBalance >= 0 ? 'text-emerald-700' : 'text-red-700')}>
              ${Math.abs(netBalance).toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="font-semibold text-slate-700 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-700">{config.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">${amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Recent Transactions</h3>
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
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{transaction.description || config.name}</p>
                        <p className="text-xs text-slate-400">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn(
                        'font-bold',
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
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
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl bg-gradient-to-r from-amber-500 to-orange-500"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                className="rounded-xl"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Expense
              </Button>
              <Button
                variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                className="rounded-xl"
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
              className="rounded-xl"
            />

            <Select
              value={newTransaction.category}
              onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
            >
              <SelectTrigger className="rounded-xl">
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
              className="rounded-xl"
            />

            <Input
              placeholder="Description (optional)"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="rounded-xl"
            />

            <Select
              value={newTransaction.payment_method}
              onValueChange={(v) => setNewTransaction({ ...newTransaction, payment_method: v })}
            >
              <SelectTrigger className="rounded-xl">
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
    </div>
  );
}