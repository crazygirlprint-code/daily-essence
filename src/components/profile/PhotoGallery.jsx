import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PhotoGallery({ photos = [], onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updatedPhotos = [...photos, file_url];
      await base44.auth.updateMe({ photo_gallery: updatedPhotos });
      onUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (photoUrl) => {
    try {
      const updatedPhotos = photos.filter(p => p !== photoUrl);
      await base44.auth.updateMe({ photo_gallery: updatedPhotos });
      onUpdate();
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 dark:bg-purple-900/30 rounded-2xl p-6 border border-stone-300 dark:border-rose-500/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-serif text-neutral-900 dark:text-stone-100">My Wellness Journey</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Moments that matter</p>
          </div>
          <Button
            onClick={() => document.getElementById('gallery-upload').click()}
            disabled={uploading}
            size="sm"
            className="gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Photo
          </Button>
          <input
            id="gallery-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-300 dark:border-rose-500/30 rounded-xl">
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              No photos yet. Start capturing your wellness journey!
            </p>
            <Button
              onClick={() => document.getElementById('gallery-upload').click()}
              disabled={uploading}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-stone-200 dark:bg-rose-950/30"
              >
                <img
                  src={photo}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setExpandedPhoto(photo)}
                />
                <button
                  onClick={() => handleRemovePhoto(photo)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Expanded Photo Modal */}
      <AnimatePresence>
        {expandedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={expandedPhoto}
              alt="Expanded"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}