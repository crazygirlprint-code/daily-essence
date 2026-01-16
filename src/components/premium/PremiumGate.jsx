import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PremiumGate({ 
  requiredTier = 'Flourish', 
  featureName = 'This feature', 
  benefits = [],
  onUpgrade
}) {
  const tierConfig = {
    Nurturer: {
      price: '$4.99',
      color: 'from-blue-100 to-sky-100',
      iconColor: 'text-blue-600',
      buttonColor: 'from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600'
    },
    Flourish: {
      price: '$9.99',
      color: 'from-purple-100 to-pink-100',
      iconColor: 'text-purple-600',
      buttonColor: 'from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700'
    },
    Radiant: {
      price: '$19.99',
      color: 'from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
      buttonColor: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
    }
  };

  const config = tierConfig[requiredTier];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-200"
      >
        <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}>
          <Lock className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-slate-800 mb-2">{requiredTier} Tier Feature</h1>
          <p className="text-slate-600">
            {featureName} is available exclusively with the {requiredTier} tier ({config.price}/month)
          </p>
        </div>

        {benefits.length > 0 && (
          <div className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-left"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <Sparkles className={`w-4 h-4 ${config.iconColor}`} />
                </div>
                <span className="text-slate-700 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        )}

        <Button 
          onClick={onUpgrade || (() => window.location.href = '/Pricing')}
          className={`w-full bg-gradient-to-r ${config.buttonColor} text-white px-8 h-12 rounded-xl shadow-lg`}
        >
          Upgrade to {requiredTier}
        </Button>
        <p className="text-xs text-slate-400 text-center mt-4">Cancel anytime</p>
      </motion.div>
    </div>
  );
}