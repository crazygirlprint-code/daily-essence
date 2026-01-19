import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, X, User, Heart, Baby, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import FamilyWall from '@/components/family/FamilyWall';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhotoAdjuster from '@/components/family/PhotoAdjuster';

const relationshipIcons = {
  self: User,
  spouse: Heart,
  husband: Heart,
  wife: Heart,
  boyfriend: Heart,
  girlfriend: Heart,
  child: Baby,
  son: Baby,
  daughter: Baby,
  father: Users,
  mother: Users,
  dad: Users,
  mom: Users,
  brother: Users,
  sister: Users,
  grandfather: Users,
  grandmother: Users,
  grandpa: Users,
  grandma: Users,
  uncle: Users,
  aunt: Users,
  cousin: Users,
  niece: Baby,
  nephew: Baby,
  friend: Users,
  other: Users
};

const colorOptions = [
  { value: 'rose', bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-200' },
  { value: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  { value: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  { value: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
  { value: 'amber', bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
  { value: 'cyan', bg: 'bg-cyan-100', text: 'text-cyan-600', ring: 'ring-cyan-200' },
];

export default function Family() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', relationship: 'child', color: 'rose', photo_url: '', photo_adjustment: null });
  const [isUploading, setIsUploading] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setIsAddOpen(false);
      setNewMember({ name: '', relationship: 'child', color: 'rose', photo_url: '', photo_adjustment: null });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setIsAddOpen(false);
      setEditingMember(null);
      setNewMember({ name: '', relationship: 'child', color: 'rose', photo_url: '', photo_adjustment: null });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyMembers'] }),
  });
  
  const getTaskCountForMember = (memberName) => {
    return tasks.filter(t => t.family_member === memberName && !t.completed).length;
  };
  
  const getColorClasses = (colorValue) => {
    return colorOptions.find(c => c.value === colorValue) || colorOptions[0];
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setNewMember({ name: member.name, relationship: member.relationship, color: member.color, photo_url: member.photo_url || '', photo_adjustment: member.photo_adjustment || null });
    setIsAddOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setTempPhotoUrl(data.file_url);
      setIsAdjusterOpen(true);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoAdjustConfirm = (adjustment) => {
    setNewMember({ ...newMember, photo_url: tempPhotoUrl, photo_adjustment: adjustment });
    setIsAdjusterOpen(false);
    setTempPhotoUrl(null);
  };

  const handlePhotoAdjustCancel = () => {
    setIsAdjusterOpen(false);
    setTempPhotoUrl(null);
  };

  const handleSave = () => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: newMember });
    } else {
      createMutation.mutate(newMember);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          
          <h1 className="text-xl font-bold text-slate-800">Family</h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-white/10">
            <TabsTrigger value="members" className="dark:text-stone-200 dark:data-[state=active]:bg-rose-700/50">Members</TabsTrigger>
            <TabsTrigger value="wall" className="dark:text-stone-200 dark:data-[state=active]:bg-rose-700/50">Family Wall</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members">
            {/* Family Members Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {members.map((member) => {
              const Icon = relationshipIcons[member.relationship] || User;
              const colorClasses = getColorClasses(member.color);
              const taskCount = getTaskCountForMember(member.name);
              
              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <div className={cn(
                    'bg-white rounded-3xl p-6 border border-slate-200 shadow-sm',
                    'hover:shadow-md transition-all duration-300',
                    'flex flex-col items-center text-center'
                  )}>
                    <div className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden',
                      colorClasses.bg
                    )}>
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover" 
                          style={member.photo_adjustment ? {
                            transform: `scale(${member.photo_adjustment.zoom})`,
                            objectPosition: `${member.photo_adjustment.position.x}% ${member.photo_adjustment.position.y}%`
                          } : {}}
                        />
                      ) : (
                        <Icon className={cn('w-8 h-8', colorClasses.text)} />
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-1">{member.name}</h3>
                    <p className="text-sm text-slate-400 capitalize mb-3">{member.relationship}</p>
                    
                    {taskCount > 0 && (
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        colorClasses.bg, colorClasses.text
                      )}>
                        {taskCount} task{taskCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-blue-100"
                        title="Edit"
                      >
                        <User className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(member.id)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-red-100"
                        title="Delete"
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Add Member Card */}
          <motion.button
            onClick={() => setIsAddOpen(true)}
            whileTap={{ scale: 0.95 }}
            className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[200px] hover:border-rose-300 hover:bg-rose-50/50 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-300" />
            </div>
            <span className="text-sm font-medium text-slate-400">Add Family Member</span>
          </motion.button>
        </div>
        
            {/* Empty State */}
            {members.length === 0 && !isLoading && (
              <div className="text-center py-12 mt-8">
                <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No family members yet</h3>
                <p className="text-slate-400">Add your family members to assign tasks to them</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="wall">
            <FamilyWall />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Member Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) {
          setEditingMember(null);
          setNewMember({ name: '', relationship: 'child', color: 'rose', photo_url: '', photo_adjustment: null });
        }
      }}>
        <DialogContent className="rounded-3xl bg-white border-stone-200">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden',
                newMember.photo_url ? '' : getColorClasses(newMember.color).bg
              )}>
                {newMember.photo_url ? (
                  <img 
                    src={newMember.photo_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    style={newMember.photo_adjustment ? {
                      transform: `scale(${newMember.photo_adjustment.zoom})`,
                      objectPosition: `${newMember.photo_adjustment.position.x}% ${newMember.photo_adjustment.position.y}%`
                    } : {}}
                  />
                ) : (
                  <User className={cn('w-12 h-12', getColorClasses(newMember.color).text)} />
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {isUploading ? 'Uploading...' : newMember.photo_url ? 'Change Photo' : 'Upload Photo'}
                </span>
              </label>
              {newMember.photo_url && (
                <>
                  <button
                    onClick={() => {
                      setTempPhotoUrl(newMember.photo_url);
                      setIsAdjusterOpen(true);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Adjust Photo
                  </button>
                  <button
                    onClick={() => setNewMember({ ...newMember, photo_url: '', photo_adjustment: null })}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove Photo
                  </button>
                </>
              )}
            </div>
            
            <Input
              placeholder="Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="rounded-xl"
            />
            
            <Select
              value={newMember.relationship}
              onValueChange={(v) => setNewMember({ ...newMember, relationship: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Me</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="husband">Husband</SelectItem>
                <SelectItem value="wife">Wife</SelectItem>
                <SelectItem value="boyfriend">Boyfriend</SelectItem>
                <SelectItem value="girlfriend">Girlfriend</SelectItem>
                <SelectItem value="son">Son</SelectItem>
                <SelectItem value="daughter">Daughter</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="dad">Dad</SelectItem>
                <SelectItem value="mom">Mom</SelectItem>
                <SelectItem value="brother">Brother</SelectItem>
                <SelectItem value="sister">Sister</SelectItem>
                <SelectItem value="grandfather">Grandfather</SelectItem>
                <SelectItem value="grandmother">Grandmother</SelectItem>
                <SelectItem value="grandpa">Grandpa</SelectItem>
                <SelectItem value="grandma">Grandma</SelectItem>
                <SelectItem value="uncle">Uncle</SelectItem>
                <SelectItem value="aunt">Aunt</SelectItem>
                <SelectItem value="cousin">Cousin</SelectItem>
                <SelectItem value="niece">Niece</SelectItem>
                <SelectItem value="nephew">Nephew</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <div>
              <p className="text-sm text-slate-500 mb-2">Color</p>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewMember({ ...newMember, color: color.value })}
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all',
                      color.bg,
                      newMember.color === color.value && `ring-2 ${color.ring}`
                    )}
                  />
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={!newMember.name.trim()}
              className="w-full rounded-xl h-12 text-white bg-slate-700 hover:bg-slate-800 shadow-lg shadow-slate-500/30"
            >
              {editingMember ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PhotoAdjuster
        imageUrl={tempPhotoUrl}
        isOpen={isAdjusterOpen}
        onConfirm={handlePhotoAdjustConfirm}
        onCancel={handlePhotoAdjustCancel}
      />
    </div>
  );
}