// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-[#0b1220] dark:to-gray-900 py-8 md:py-12 px-4 md:min-h-screen">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white dark:bg-[#1a2332] rounded-xl shadow-xl',
            }
          }}
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}

export const runtime = 'edge';
