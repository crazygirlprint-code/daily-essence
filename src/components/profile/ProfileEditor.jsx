import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, MapPin, Briefcase, Phone, Home, Calendar, Save, X, Camera, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProfileEditor({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    display_name: user?.display_name || user?.full_name || '',
    profile_picture: user?.profile_picture || '',
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
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField('profile_picture', file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-white/50 dark:bg-purple-900/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-500/60 space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif text-neutral-900 dark:text-stone-100">Edit Profile</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label className="text-slate-900 dark:text-stone-100">Profile Picture</Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {formData.profile_picture ? (
              <img 
                src={formData.profile_picture} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 dark:border-purple-500/60"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-stone-200 dark:from-rose-900/40 dark:to-pink-900/30 flex items-center justify-center border-2 border-purple-300 dark:border-purple-500/60">
                <User className="w-10 h-10 text-stone-600 dark:text-stone-300" />
              </div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('profile-picture-input').click()}
              disabled={uploadingImage}
              className="border-2 border-purple-200 dark:border-purple-500/60"
            >
              <Camera className="w-4 h-4 mr-2" />
              {formData.profile_picture ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {formData.profile_picture && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateField('profile_picture', '')}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-900 dark:text-stone-100">
          <User className="w-4 h-4" />
          Display Name
        </Label>
        <Input
          value={formData.display_name}
          onChange={(e) => updateField('display_name', e.target.value)}
          placeholder="Your name"
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
          className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-500/60 bg-white dark:bg-purple-950/30 text-slate-900 dark:text-stone-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
          className="border-2 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/60"
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
        <Button type="button" variant="outline" onClick={onCancel} className="border-2 border-purple-200 dark:border-purple-500/60">
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}