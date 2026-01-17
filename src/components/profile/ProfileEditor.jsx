import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, MapPin, Briefcase, Phone, Home, Calendar, Save, X } from 'lucide-react';

export default function ProfileEditor({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    birthday: user?.birthday || '',
    city: user?.city || '',
    profession: user?.profession || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    // Privacy settings
    birthday_public: user?.birthday_public ?? false,
    city_public: user?.city_public ?? true,
    profession_public: user?.profession_public ?? true,
    phone_public: user?.phone_public ?? false,
    address_public: user?.address_public ?? false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-white/50 dark:bg-purple-900/30 rounded-2xl p-6 border border-stone-300 dark:border-rose-500/30 space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif text-neutral-900 dark:text-stone-100">Edit Profile</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
          <User className="w-4 h-4" />
          Full Name
        </Label>
        <Input
          value={formData.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
          placeholder="Your name"
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-stone-100">About Me</Label>
        <textarea
          value={formData.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-rose-500/30 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-stone-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Birthday */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
            <Calendar className="w-4 h-4" />
            Birthday
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">Public</span>
            <Switch
              checked={formData.birthday_public}
              onCheckedChange={(checked) => updateField('birthday_public', checked)}
            />
          </div>
        </div>
        <Input
          type="date"
          value={formData.birthday}
          onChange={(e) => updateField('birthday', e.target.value)}
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
            <MapPin className="w-4 h-4" />
            City
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">Public</span>
            <Switch
              checked={formData.city_public}
              onCheckedChange={(checked) => updateField('city_public', checked)}
            />
          </div>
        </div>
        <Input
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          placeholder="Your city"
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* Profession */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
            <Briefcase className="w-4 h-4" />
            Profession
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">Public</span>
            <Switch
              checked={formData.profession_public}
              onCheckedChange={(checked) => updateField('profession_public', checked)}
            />
          </div>
        </div>
        <Input
          value={formData.profession}
          onChange={(e) => updateField('profession', e.target.value)}
          placeholder="Your profession"
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">Public</span>
            <Switch
              checked={formData.phone_public}
              onCheckedChange={(checked) => updateField('phone_public', checked)}
            />
          </div>
        </div>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="Your phone number"
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
            <Home className="w-4 h-4" />
            Address
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 dark:text-stone-400">Public</span>
            <Switch
              checked={formData.address_public}
              onCheckedChange={(checked) => updateField('address_public', checked)}
            />
          </div>
        </div>
        <Input
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Your address"
          className="dark:bg-purple-950/30 dark:border-rose-500/30"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700 gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="dark:border-rose-500/30">
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}