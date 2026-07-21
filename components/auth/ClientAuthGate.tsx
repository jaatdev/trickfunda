"use client";

import { useAuth, SignInButton } from '@clerk/nextjs';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  // Show nothing while Clerk is initializing (this prevents hydration mismatch and flashing)
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white dark:bg-[#111]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If signed in, render the protected content
  if (isSignedIn) {
    return <>{children}</>;
  }

  // If signed out, render the lock screen
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] overflow-y-auto">
      <div className="max-w-md w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-emerald-500/20 blur-[50px] pointer-events-none" />
        
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          Unlock the Study Material
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          You are about to access our premium learning framework. Please sign in or create a free account to continue exploring the Study Material.
        </p>

        <SignInButton mode="modal" fallbackRedirectUrl="/study-material" signUpFallbackRedirectUrl="/study-material">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 px-6 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl">
            <Sparkles className="w-5 h-5" />
            Sign In to Continue
          </button>
        </SignInButton>

        <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            Return to Homepage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
