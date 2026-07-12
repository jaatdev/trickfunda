// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-[#0b1220] dark:to-gray-900 py-8 md:py-12 px-4 md:min-h-screen">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white dark:bg-[#1a2332] rounded-xl shadow-xl',
            }
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
