import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { value: 'sleep', label: 'Better Sleep' },
  { value: 'stress', label: 'Stress Reduction' },
  { value: 'fitness', label: 'Fitness & Movement' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'social', label: 'Social Connections' },
  { value: 'other', label: 'Other' },
];

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(goal || {
    name: '',
    description: '',
    category: 'stress',
    priority: 'medium',
    target_date: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-purple-900/30 rounded-2xl p-6 border border-stone-300 dark:border-rose-500/30 shadow-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Goal Name</label>
          <Input
            placeholder="e.g., Get 8 hours of sleep"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
          <Textarea
            placeholder="Why is this goal important to you?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Priority</label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Target Date</label>
          <Input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="dark:border-rose-500/30">
            Cancel
          </Button>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700">
            Save Goal
          </Button>
        </div>
      </form>
    </motion.div>
  );
}