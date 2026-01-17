import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function YourWhy({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(user?.your_why || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ your_why: value });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving your why:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(user?.your_why || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-100/50 rounded-2xl p-6 border border-stone-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-stone-800">Your Why</h3>
            <p className="text-xs text-stone-600">What drives you forward</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            className="gap-2 bg-slate-800 hover:bg-slate-700"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Share your motivation, values, or the reason you started this journey..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {user?.your_why ? (
            <p className="text-slate-900 leading-relaxed italic">
              "{user.your_why}"
            </p>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-stone-300 rounded-xl">
              <p className="text-stone-600 mb-3">
                Share what motivates you on this wellness journey
              </p>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-slate-800 hover:bg-slate-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Write Your Why
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}