import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ShareButton({ item, itemType, onShare }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const queryClient = useQueryClient();

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyPosts'] });
      setShowDialog(false);
      setSelectedMembers([]);
      onShare?.();
    },
  });

  const handleShare = () => {
    const memberNames = selectedMembers.map(id => 
      familyMembers.find(m => m.id === id)?.name
    ).filter(Boolean).join(', ');

    let message = '';
    switch (itemType) {
      case 'task':
        message = `📋 Shared task: "${item.title}" with ${memberNames}`;
        break;
      case 'meal':
        message = `🍳 Shared meal plan: ${item.meal_name} (${item.meal_type}) with ${memberNames}`;
        break;
      case 'event':
        message = `📅 Shared event: "${item.title}" on ${item.date} with ${memberNames}`;
        break;
      default:
        message = `Shared ${itemType} with ${memberNames}`;
    }

    createPostMutation.mutate({
      message,
      type: 'update',
      reactions: []
    });
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        size="sm"
        variant="ghost"
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Share with Family
            </DialogTitle>
            <DialogDescription>
              Select family members to share this {itemType} with
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {familyMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <motion.button
                  key={member.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: member.color || '#8B5CF6' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-700">{member.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.relationship}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {familyMembers.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">
              No family members yet. Add them first!
            </p>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setShowDialog(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedMembers.length === 0 || createPostMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}