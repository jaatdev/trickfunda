import { auth } from '@clerk/nextjs/server';
import { SignInButton } from '@clerk/nextjs';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function ProtectedToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();

  if (!userId && process.env.NODE_ENV !== 'development') {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-4 bg-[#030014] overflow-y-auto">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-xl">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-violet-500/20 blur-[50px] pointer-events-none" />
          
          <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-3 text-white">
            Unlock Pro Tools
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            You are about to access our premium ecosystem of tools. Please sign in or create a free account to continue exploring the TrickFunda Tools.
          </p>

          <SignInButton mode="modal" fallbackRedirectUrl="/tools" signUpFallbackRedirectUrl="/tools">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-3.5 px-6 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl">
              <Sparkles className="w-5 h-5" />
              Sign In to Continue
            </button>
          </SignInButton>

          <div className="mt-6 border-t border-white/5 pt-6">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors">
              Return to Tools Hub
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
