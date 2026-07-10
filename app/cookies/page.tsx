'use client';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Cookie, Settings, Eye, Shield } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-amber-950 to-orange-950">
      <section className="relative pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                <span className="text-amber-400 text-sm font-medium">🍪 Cookie Policy</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Cookie Policy
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                How TrickFunda uses cookies to enhance your experience
              </p>
              <p className="text-sm text-slate-500 mt-4">Last updated: January 2025</p>
              <p className="text-sm text-slate-500">Managed by Kapil Chaudhary</p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={200}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-600/50 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">What Are Cookies?</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>Cookies are small text files stored on your device when you visit TrickFunda. They help <strong className="text-white">Kapil Chaudhary</strong> and the TrickFunda team provide you with a better, faster, and safer experience.</p>
                <p>We use cookies to remember your preferences, understand how you use our service, and improve your overall experience.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-600/50 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Types of Cookies We Use</h2>
              </div>
              <div className="space-y-6 text-slate-300">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">1. Essential Cookies</h3>
                  <p>Required for the Service to function properly. These enable core functionality like security, authentication, and accessibility.</p>
                  <p className="text-sm text-amber-400 mt-2">Cannot be disabled</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">2. Performance Cookies</h3>
                  <p>Help us understand how visitors interact with TrickFunda by collecting anonymous information about page visits and user behavior.</p>
                  <p className="text-sm text-slate-500 mt-2">Examples: Google Analytics, performance monitoring</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">3. Functionality Cookies</h3>
                  <p>Remember your preferences and settings like theme choice, language, and study progress to provide enhanced features.</p>
                  <p className="text-sm text-slate-500 mt-2">Examples: Theme preferences, font size, reading settings</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">4. Targeting Cookies</h3>
                  <p>May be set by our advertising partners to build a profile of your interests and show relevant content.</p>
                  <p className="text-sm text-slate-500 mt-2">Can be disabled in settings</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={400}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-600/50 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Third-Party Cookies</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>TrickFunda may use third-party services that set their own cookies. These include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Google Analytics</strong> - For understanding user behavior and improving the Service</li>
                  <li><strong className="text-white">Authentication Providers</strong> - For secure login and account management</li>
                  <li><strong className="text-white">CDN Services</strong> - For faster content delivery</li>
                  <li><strong className="text-white">Payment Processors</strong> - For handling subscription payments securely</li>
                </ul>
                <p className="text-sm text-amber-400">Kapil Chaudhary carefully selects third-party services that comply with industry-standard privacy practices.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={500}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-600/50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Managing Cookies</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Using the cookie consent banner when you first visit TrickFunda</li>
                  <li>Adjusting your browser settings to refuse cookies</li>
                  <li>Deleting cookies already stored on your device</li>
                  <li>Using browser extensions that block tracking cookies</li>
                </ul>
                <p className="text-amber-400 font-semibold">Note: Disabling certain cookies may affect the functionality of TrickFunda.</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-up" delay={600}>
            <div className="bg-linear-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Browser-Specific Instructions</h2>
              <div className="space-y-4 text-slate-300">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Chrome</h3>
                  <p className="text-sm">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Firefox</h3>
                  <p className="text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Safari</h3>
                  <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Edge</h3>
                  <p className="text-sm">Settings → Cookies and site permissions → Manage and delete cookies</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="scale" delay={700}>
            <div className="mt-12 bg-linear-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About Cookies?</h3>
              <p className="text-amber-50 mb-6">Contact Kapil Chaudhary for more information about our cookie practices</p>
              <button className="px-8 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-all hover:scale-105">
                Contact Us
              </button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
