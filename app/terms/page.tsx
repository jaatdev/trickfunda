'use client';
import ScrollAnimation from '@/components/ScrollAnimation';
import { FileText, Scale, Shield, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="relative pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,100,100,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-full mb-6">
                <span className="text-slate-300 text-sm font-medium">📜 Terms of Service</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-slate-200 via-slate-300 to-slate-400 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Please read these terms carefully before using TrickFunda
              </p>
              <p className="text-sm text-slate-500 mt-4">Last updated: January 2025</p>
              <p className="text-sm text-slate-500">Owned and operated by Kapil Chaudhary</p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={200}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-slate-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Agreement to Terms</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>By accessing or using TrickFunda ("the Service"), you agree to be bound by these Terms of Service. The Service is owned and operated by <strong className="text-white">Kapil Chaudhary</strong>, BCA graduate from CCS University (2023) and MCA from GLA University, Mathura (2025).</p>
                <p>If you disagree with any part of these terms, you may not access the Service.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Use License</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>Permission is granted to temporarily access and use the Service for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.</p>
                <p className="font-semibold text-white">You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for commercial purposes</li>
                  <li>Attempt to reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                  <li>Use the Service in any way that violates applicable laws</li>
                </ul>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={400}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">User Accounts</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
                <p>You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security.</p>
                <p>Kapil Chaudhary reserves the right to refuse service, terminate accounts, or remove content at our sole discretion.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={500}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-slate-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Intellectual Property</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>The Service and its original content, features, and functionality are owned by <strong className="text-white">Kapil Chaudhary</strong> and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                <p>Our trademarks and trade dress may not be used in connection with any product or service without prior written consent of Kapil Chaudhary.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={600}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Additional Terms</h2>
              <div className="space-y-6 text-slate-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Disclaimer</h3>
                  <p>The Service is provided "as is" without warranties of any kind. Kapil Chaudhary does not warrant that the Service will be uninterrupted, secure, or error-free.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Limitation of Liability</h3>
                  <p>In no event shall Kapil Chaudhary be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Governing Law</h3>
                  <p>These Terms shall be governed by the laws of India without regard to its conflict of law provisions.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">4. Changes to Terms</h3>
                  <p>Kapil Chaudhary reserves the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">5. Contact Information</h3>
                  <p>For questions about these Terms, please contact Kapil Chaudhary through our contact page.</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="scale" delay={700}>
            <div className="mt-12 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About Our Terms?</h3>
              <p className="text-slate-400 mb-6">Contact us for clarification on any terms or conditions</p>
              <button className="px-8 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all hover:scale-105">
                Contact Us
              </button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
