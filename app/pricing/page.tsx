'use client'

import { motion } from 'framer-motion'
import { Check, X, Sparkles, Zap, Crown, Gift } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    icon: Gift,
    features: [
      { text: 'Access to 5 subjects', included: true },
      { text: 'Basic flashcards', included: true },
      { text: 'Quiz mode', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Mobile app', included: true },
      { text: 'Spaced repetition', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Offline mode', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom study plans', included: false },
    ],
    color: 'from-emerald-500 to-teal-500',
    popular: false,
    savings: null
  },
  {
    name: 'Pro',
    price: '9',
    description: 'For serious learners',
    icon: Zap,
    features: [
      { text: 'Access to ALL subjects', included: true },
      { text: 'Advanced flashcards', included: true },
      { text: 'Unlimited quizzes', included: true },
      { text: 'Detailed progress tracking', included: true },
      { text: 'Mobile + Desktop apps', included: true },
      { text: 'Spaced repetition (SM-2)', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Full offline mode', included: true },
      { text: 'Priority email support', included: true },
      { text: 'AI-powered study plans', included: true },
    ],
    color: 'from-violet-500 to-purple-500',
    popular: true,
    savings: 'Save $30/year'
  },
  {
    name: 'Lifetime',
    price: '199',
    description: 'One-time payment, forever access',
    icon: Crown,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Lifetime updates', included: true },
      { text: 'All future features', included: true },
      { text: 'VIP support (24/7)', included: true },
      { text: 'Early access to beta features', included: true },
      { text: 'Exclusive content library', included: true },
      { text: 'Personal learning coach', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'API access', included: true },
      { text: 'Lifetime guarantee', included: true },
    ],
    color: 'from-amber-500 to-orange-500',
    popular: false,
    savings: 'Best value - Pay once!'
  }
]

const testimonials = [
  { name: 'Sarah K.', text: 'Pro plan helped me ace UPSC! Worth every penny.', plan: 'Pro' },
  { name: 'Rahul M.', text: 'Lifetime is the best investment I made for my career.', plan: 'Lifetime' },
  { name: 'Priya S.', text: 'Started with Free, upgraded to Pro. Amazing!', plan: 'Pro' }
]

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes! Upgrade or downgrade anytime. No questions asked.' },
  { q: 'Is there a refund policy?', a: '30-day money-back guarantee on all paid plans.' },
  { q: 'What payment methods do you accept?', a: 'Credit cards, PayPal, UPI, and more.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Contact us with your student ID for 20% off.' }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      <section className="relative pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-block px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">💰 Simple, Transparent Pricing</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>

            {/* Billing toggle */}
            <motion.div 
              className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
 billingCycle === 'monthly' 
 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
 : 'text-gray-600 dark:text-gray-400'
 }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-full font-bold transition-all relative ${
 billingCycle === 'yearly' 
 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
 : 'text-gray-600 dark:text-gray-400'
 }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onHoverStart={() => setHoveredPlan(idx)}
                onHoverEnd={() => setHoveredPlan(null)}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⭐ Most Popular
                  </motion.div>
                )}
                
                <motion.div 
                  className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 ${
 plan.popular ? 'border-violet-500' : 'border-gray-200 dark:border-gray-700'
 } overflow-hidden`}
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0`}
                    animate={{ opacity: hoveredPlan === idx ? 0.05 : 0 }}
                  />

                  <div className="relative z-10">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}
                      animate={hoveredPlan === idx ? { rotate: 360 } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-black text-gray-900 dark:text-white">
                        $<AnimatedCounter 
                          end={parseInt(billingCycle === 'yearly' && plan.name === 'Pro' ? '7' : plan.price)} 
                          duration={1.5}
                        />
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {plan.name === 'Lifetime' ? ' once' : billingCycle === 'yearly' ? '/month' : '/month'}
                      </span>
                      {plan.savings && (
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                          {plan.savings}
                        </div>
                      )}
                    </div>
                    
                    <motion.button
                      className={`w-full py-4 rounded-xl font-bold text-lg mb-8 ${
 plan.popular 
 ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
 : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
 }`}
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {plan.name === 'Free' ? 'Start Free' : 'Get Started'}
                    </motion.button>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + i * 0.05 }}
                        >
                          {feature.included ? (
                            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                            {feature.text}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{testimonial.name}</span>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">{testimonial.plan} User</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-black mb-4">Still have questions?</h2>
            <p className="text-xl mb-8 text-emerald-100">We're here to help! Contact our support team.</p>
            <Link href="/contact">
              <motion.button
                className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us 💬
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
