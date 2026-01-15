import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Home, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Perfect for getting started with ads',
    color: 'from-slate-50 to-stone-50',
    borderColor: 'border-stone-200',
    buttonColor: 'bg-stone-600 hover:bg-stone-700',
    badge: 'Includes Ads',
    features: [
      { text: 'Daily task planner', included: true },
      { text: 'Affirmations & meditation', included: true },
      { text: 'Self-care tracking', included: true },
      { text: 'Family member management', included: true },
      { text: 'Basic meal planning', included: true },
      { text: 'Beauty routine tracking', included: true },
      { text: 'Ad-free experience', included: false },
      { text: 'Advanced budgeting', included: false },
      { text: 'Financial analytics', included: false },
      { text: 'Priority support', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    priceId: 'price_1SpuUjK9Na9KxcTLwLVxgUJW',
    description: 'Everything plus: Advanced budgeting, analytics & ad-free',
    color: 'from-gradient-to-purple via-gradient-to-pink to-gradient-to-rose',
    borderColor: 'border-purple-400/50',
    buttonColor: 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700',
    highlighted: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Advanced budgeting tools', included: true },
      { text: 'Detailed financial analytics', included: true },
      { text: 'Spending insights & reports', included: true },
      { text: 'Budget category customization', included: true },
      { text: 'Transaction tracking', included: true },
      { text: 'Monthly financial summaries', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Early access to new features', included: true },
    ]
  },
];

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (priceId, planName) => {
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        priceId,
        planName
      });

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Pricing Plans</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Intro Text */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-slate-600 text-lg mb-4">
            Choose the perfect plan for your wellness and productivity journey
          </p>
          <p className="text-sm text-slate-500">
            Start free, upgrade anytime. All features can be tested before purchase.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl border-2 ${plan.borderColor} transition-all duration-300 ${
                plan.highlighted 
                  ? 'md:scale-105 shadow-2xl' 
                  : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} rounded-3xl -z-10`} />

              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-gradient-to-r from-purple-600 to-rose-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-stone-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                {/* Plan Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-600 ml-2">/month</span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => plan.priceId ? handleCheckout(plan.priceId, plan.name) : null}
                  disabled={isLoading || !plan.priceId}
                  className={`w-full h-11 rounded-xl font-semibold text-white mb-8 ${plan.buttonColor}`}
                >
                  {plan.priceId ? 'Upgrade Now' : 'Get Started Free'}
                </Button>

                {/* Features List */}
                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          feature.included ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-slate-700' : 'text-slate-400 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Questions?</h3>
          <p className="text-slate-600 mb-4">
            All plans come with a 7-day free trial of premium features. No credit card required.
          </p>
          <p className="text-slate-500 text-sm">
            Questions about billing? Contact support@dailyessence.app
          </p>
        </div>
      </div>
    </div>
  );
}