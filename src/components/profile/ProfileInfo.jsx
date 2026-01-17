import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Phone, Home, Calendar, Edit, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ProfileInfo({ user, onEdit }) {
  const fields = [
    { 
      icon: Calendar, 
      label: 'Birthday', 
      value: user?.birthday ? format(new Date(user.birthday), 'MMMM d, yyyy') : null,
      isPublic: user?.birthday_public 
    },
    { 
      icon: MapPin, 
      label: 'City', 
      value: user?.city,
      isPublic: user?.city_public 
    },
    { 
      icon: Briefcase, 
      label: 'Profession', 
      value: user?.profession,
      isPublic: user?.profession_public 
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: user?.phone,
      isPublic: user?.phone_public 
    },
    { 
      icon: Home, 
      label: 'Address', 
      value: user?.address,
      isPublic: user?.address_public 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-purple-900/30 rounded-2xl p-6 border border-stone-300 dark:border-rose-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif text-neutral-900 dark:text-stone-100">About Me</h3>
        <Button
          onClick={onEdit}
          size="sm"
          className="gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700 text-white"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Bio */}
      {user?.bio && (
        <div className="mb-6 pb-6 border-b border-stone-200 dark:border-rose-500/20">
          <p className="text-slate-700 dark:text-stone-300 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Info Fields */}
      <div className="space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          if (!field.value) return null;
          
          return (
            <div key={field.label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100/60 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-900 dark:text-rose-100" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-widest">
                    {field.label}
                  </p>
                  {!field.isPublic && (
                    <Lock className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                  )}
                </div>
                <p className="text-slate-900 dark:text-stone-100 font-medium">{field.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!user?.bio && fields.every(f => !f.value) && (
        <div className="text-center py-8">
          <p className="text-stone-600 dark:text-stone-400">
            No information added yet. Click "Edit Profile" above to add your details.
          </p>
        </div>
      )}
    </motion.div>
  );
}