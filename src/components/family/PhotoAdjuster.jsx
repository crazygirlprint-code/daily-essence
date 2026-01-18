import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PhotoAdjuster({ imageUrl, isOpen, onConfirm, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirm = () => {
    onConfirm({ zoom, position });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Preview Container */}
          <div 
            className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-slate-100 cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageUrl}
              alt="Adjust"
              className="absolute w-full h-full object-cover select-none"
              style={{
                transform: `scale(${zoom})`,
                objectPosition: `${position.x}% ${position.y}%`
              }}
              draggable={false}
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-2xl" />
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ZoomOut className="w-4 h-4" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4" />
            </div>
            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
              <Move className="w-3 h-3" />
              Drag to reposition
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}